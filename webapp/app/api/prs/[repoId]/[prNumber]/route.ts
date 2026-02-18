import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { prisma } from '@/lib/db/client'
import { createUserClient } from '@/lib/github/client'
import { getPullRequest, createPullRequest, updatePullRequestAnalysis } from '@/lib/db/queries'

export async function GET(
  request: NextRequest,
  { params }: { params: { repoId: string; prNumber: string } }
) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const repo = await prisma.repository.findUnique({
      where: { id: params.repoId },
    })

    if (!repo || repo.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const pr = await getPullRequest(params.repoId, parseInt(params.prNumber))

    if (!pr) {
      return NextResponse.json({ error: 'Pull request not found' }, { status: 404 })
    }

    return NextResponse.json({ pullRequest: pr })
  } catch (error) {
    console.error('Error fetching PR:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pull request' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { repoId: string; prNumber: string } }
) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const repo = await prisma.repository.findUnique({
      where: { id: params.repoId },
    })

    if (!repo || repo.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get user's GitHub token
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user?.accessToken) {
      return NextResponse.json(
        { error: 'GitHub access token not found' },
        { status: 401 }
      )
    }

    const github = createUserClient(user.accessToken)

    // Fetch PR from GitHub
    const prData = await github.getPullRequest(repo.owner, repo.name, parseInt(params.prNumber))
    const prFiles = await github.getPullRequestFiles(repo.owner, repo.name, parseInt(params.prNumber))

    // Create or update PR in database
    const pr = await prisma.pullRequest.upsert({
      where: {
        repositoryId_prNumber: {
          repositoryId: params.repoId,
          prNumber: parseInt(params.prNumber),
        },
      },
      update: {
        title: prData.title,
        state: prData.state,
        headSha: prData.head.sha,
        baseSha: prData.base.sha,
        author: prData.user?.login || '',
        changedFiles: prFiles.map(f => f.filename),
        additions: prData.additions,
        deletions: prData.deletions,
      },
      create: {
        prNumber: parseInt(params.prNumber),
        repositoryId: params.repoId,
        title: prData.title,
        state: prData.state,
        headSha: prData.head.sha,
        baseSha: prData.base.sha,
        author: prData.user?.login || '',
        changedFiles: prFiles.map(f => f.filename),
        additions: prData.additions,
        deletions: prData.deletions,
        analysisStatus: 'pending',
      },
    })

    return NextResponse.json({ pullRequest: pr })
  } catch (error) {
    console.error('Error analyzing PR:', error)
    return NextResponse.json(
      { error: 'Failed to analyze pull request' },
      { status: 500 }
    )
  }
}

