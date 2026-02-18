import { NextRequest, NextResponse } from 'next/server'
import { verifyWebhookSignature } from '@/lib/github/webhook'
import { prisma } from '@/lib/db/client'
import { createAppClient } from '@/lib/github/client'
import { createPullRequest, updatePullRequestAnalysis } from '@/lib/db/queries'
import { createTestJob } from '@/lib/db/queries'
import { createActionFeed } from '@/lib/db/queries'
import { getJobProcessor } from '@/lib/queue/processor'

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('x-hub-signature-256')
    const event = request.headers.get('x-github-event')
    const deliveryId = request.headers.get('x-github-delivery')

    if (!signature || !event || !deliveryId) {
      return NextResponse.json(
        { error: 'Missing required headers' },
        { status: 400 }
      )
    }

    const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET
    if (!webhookSecret) {
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      )
    }

    // Get raw body for signature verification
    const body = await request.text()
    
    // Verify signature
    if (!verifyWebhookSignature(body, signature, webhookSecret)) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }

    const payload = JSON.parse(body)

    // Handle different event types
    switch (event) {
      case 'pull_request':
        await handlePullRequestEvent(payload)
        break
      case 'push':
        await handlePushEvent(payload)
        break
      case 'installation':
        await handleInstallationEvent(payload)
        break
      case 'installation_repositories':
        await handleInstallationRepositoriesEvent(payload)
        break
      default:
        console.log(`Unhandled event type: ${event}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    )
  }
}

async function handlePullRequestEvent(payload: any) {
  const { action, pull_request, repository } = payload

  if (action !== 'opened' && action !== 'synchronize') {
    return // Only handle opened and updated PRs
  }

  // Find repository in database
  const repo = await prisma.repository.findFirst({
    where: { fullName: repository.full_name },
  })

  if (!repo || !repo.enabled) {
    return // Repository not tracked or disabled
  }

  // Get GitHub App client
  const appId = process.env.GITHUB_APP_ID!
  const privateKey = process.env.GITHUB_APP_PRIVATE_KEY!
  
  // Get installation
  const installation = await prisma.installation.findUnique({
    where: { installationId: payload.installation.id },
  })

  if (!installation) {
    return
  }

  const github = createAppClient(appId, privateKey, installation.installationId)

  // Get PR files
  const prFiles = await github.getPullRequestFiles(
    repository.owner.login,
    repository.name,
    pull_request.number
  )

  // Filter files based on repository settings
  let targetFiles = prFiles.map(f => f.filename)
  
  if (repo.onlyChangedFiles) {
    // Only analyze changed files
    targetFiles = prFiles
      .filter(f => f.status === 'added' || f.status === 'modified')
      .map(f => f.filename)
  }

  // Filter out protected directories
  if (repo.protectedDirs.length > 0) {
    targetFiles = targetFiles.filter(file => {
      return !repo.protectedDirs.some(dir => file.startsWith(dir))
    })
  }

  // Create or update PR in database
  const pr = await prisma.pullRequest.upsert({
    where: {
      repositoryId_prNumber: {
        repositoryId: repo.id,
        prNumber: pull_request.number,
      },
    },
    update: {
      title: pull_request.title,
      state: pull_request.state,
      headSha: pull_request.head.sha,
      baseSha: pull_request.base.sha,
      author: pull_request.user.login,
      changedFiles: prFiles.map(f => f.filename),
      additions: pull_request.additions,
      deletions: pull_request.deletions,
      analysisStatus: 'pending',
    },
    create: {
      prNumber: pull_request.number,
      repositoryId: repo.id,
      title: pull_request.title,
      state: pull_request.state,
      headSha: pull_request.head.sha,
      baseSha: pull_request.base.sha,
      author: pull_request.user.login,
      changedFiles: prFiles.map(f => f.filename),
      additions: pull_request.additions,
      deletions: pull_request.deletions,
      analysisStatus: 'pending',
    },
  })

  // Check if we should auto-generate tests
  if (repo.autoGenerateTests && targetFiles.length > 0) {
    // Create test job
    const job = await createTestJob({
      repositoryId: repo.id,
      pullRequestId: pr.id,
      jobType: 'pr_analysis',
      targetFiles,
    })

    // Process job in background
    const processor = getJobProcessor()
    processor.processJob(job.id).catch(console.error)

    // Create action feed entry
    await createActionFeed({
      repositoryId: repo.id,
      actionType: 'pr_suggestion',
      title: `Analyzing PR #${pull_request.number}`,
      description: `Generating tests for ${targetFiles.length} file(s)`,
      prNumber: pull_request.number,
      prUrl: pull_request.html_url,
      metadata: { jobId: job.id },
    })
  } else {
    // Just analyze and comment
    await analyzePRAndComment(repo, pr, github, pull_request, prFiles)
  }
}

async function analyzePRAndComment(
  repo: any,
  pr: any,
  github: any,
  pullRequest: any,
  prFiles: any[]
) {
  // Update PR analysis status
  await updatePullRequestAnalysis(repo.id, pr.prNumber, {
    analysisStatus: 'analyzing',
  })

  // Determine risk level based on changes
  const totalChanges = prFiles.reduce((sum, f) => sum + f.changes, 0)
  const riskLevel = totalChanges > 500 ? 'high' : totalChanges > 100 ? 'medium' : 'low'

  // Create comment with suggestions
  const commentBody = `## Hiro Analysis

**Files Changed:** ${prFiles.length}
**Total Changes:** +${pullRequest.additions} -${pullRequest.deletions}
**Risk Level:** ${riskLevel}

### Files Needing Tests:
${prFiles
  .filter(f => f.status === 'added' || f.status === 'modified')
  .map(f => `- \`${f.filename}\``)
  .join('\n')}

Would you like Hiro to generate tests for these files? Reply with \`@hiro generate tests\` to proceed.`

  try {
    const comment = await github.createComment(
      repo.owner,
      repo.name,
      pullRequest.number,
      commentBody
    )

    await updatePullRequestAnalysis(repo.id, pr.prNumber, {
      analysisStatus: 'completed',
      riskLevel,
      hiroCommentId: comment.id,
    })

    await createActionFeed({
      repositoryId: repo.id,
      actionType: 'pr_suggestion',
      title: `Suggested tests for PR #${pullRequest.number}`,
      description: `Analyzed ${prFiles.length} changed file(s)`,
      prNumber: pullRequest.number,
      prUrl: pullRequest.html_url,
      riskLevel,
    })
  } catch (error) {
    console.error('Error creating comment:', error)
    await updatePullRequestAnalysis(repo.id, pr.prNumber, {
      analysisStatus: 'failed',
    })
  }
}

async function handlePushEvent(payload: any) {
  // Handle push events if needed
  // For now, we'll focus on PR events
  console.log('Push event received:', payload.repository.full_name)
}

async function handleInstallationEvent(payload: any) {
  const { action, installation } = payload

  if (action === 'created') {
    await prisma.installation.create({
      data: {
        installationId: installation.id,
        accountId: installation.account.id.toString(),
        accountType: installation.account.type,
        accountLogin: installation.account.login,
      },
    })
  } else if (action === 'deleted') {
    await prisma.installation.delete({
      where: { installationId: installation.id },
    })
  }
}

async function handleInstallationRepositoriesEvent(payload: any) {
  const { action, installation, repositories_added, repositories_removed } = payload

  const installationRecord = await prisma.installation.findUnique({
    where: { installationId: installation.id },
  })

  if (!installationRecord) {
    return
  }

  // Add new repositories
  if (repositories_added && repositories_added.length > 0) {
    for (const repo of repositories_added) {
      await prisma.repository.upsert({
        where: { githubId: repo.id },
        update: {
          installationId: installation.id,
        },
        create: {
          githubId: repo.id,
          name: repo.name,
          fullName: repo.full_name,
          owner: repo.owner.login,
          private: repo.private,
          defaultBranch: repo.default_branch,
          language: repo.language || undefined,
          installationId: installation.id,
        },
      })
    }
  }

  // Remove repositories
  if (repositories_removed && repositories_removed.length > 0) {
    const repoIds = repositories_removed.map((r: any) => r.id)
    await prisma.repository.updateMany({
      where: {
        githubId: { in: repoIds },
      },
      data: {
        enabled: false,
      },
    })
  }
}

