import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { prisma } from '@/lib/db/client'
import { createUserClient } from '@/lib/github/client'
import { createGroqLLM } from '@/lib/llm/groq'
import { createTestJob, createTestResult } from '@/lib/db/queries'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { repositoryId, targetFiles, pullRequestId } = body

    if (!repositoryId || !targetFiles || !Array.isArray(targetFiles)) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify repository belongs to user
    const repo = await prisma.repository.findUnique({
      where: { id: repositoryId },
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

    // Create job
    const job = await createTestJob({
      repositoryId,
      pullRequestId,
      jobType: pullRequestId ? 'pr_analysis' : 'full_repo',
      targetFiles,
    })

    // Start processing in background (in production, use a proper job queue)
    processTestGeneration(job.id, repositoryId, targetFiles, user.accessToken, pullRequestId || undefined)
      .catch(console.error)

    return NextResponse.json({ job }, { status: 201 })
  } catch (error) {
    console.error('Error creating test generation job:', error)
    return NextResponse.json(
      { error: 'Failed to create test generation job' },
      { status: 500 }
    )
  }
}

async function processTestGeneration(
  jobId: string,
  repositoryId: string,
  targetFiles: string[],
  githubToken: string,
  pullRequestId?: string
) {
  try {
    await prisma.testJob.update({
      where: { id: jobId },
      data: { status: 'processing', startedAt: new Date() },
    })

    const repo = await prisma.repository.findUnique({
      where: { id: repositoryId },
    })

    if (!repo) {
      throw new Error('Repository not found')
    }

    const github = createUserClient(githubToken)
    const llm = createGroqLLM()

    // Get repository tree
    const treeData = await github.getRepoTree(repo.owner, repo.name)
    const treeString = JSON.stringify(treeData.tree, null, 2)

    // Get repository structure for context
    const { fullContext } = await github.getRepositoryStructure(repo.owner, repo.name)
    const fullContextString = fullContext.join('\n')

    let processed = 0
    for (const filePath of targetFiles) {
      try {
        // Get file content
        const fileContent = await github.getFileContent(repo.owner, repo.name, filePath)

        // Generate tests
        const result = await llm.generateTests({
          fileTree: treeString,
          fullContext: fullContextString,
          codeContext: fileContent,
          userPrompt: 'Generate a test function for this file',
        })

        // Determine test file path
        const fileExt = filePath.split('.').pop() || ''
        const fileName = filePath.split('/').pop()?.split('.')[0] || 'test'
        const testFilePath = `hiro-tests/test_${fileName}.test.${fileExt}`

        // Save test result
        await createTestResult({
          jobId,
          repositoryId,
          filePath,
          testFilePath,
          testCode: result.code,
          metadata: result.metadata,
          requiredPackages: result.packages,
        })

        processed++
        await prisma.testJob.update({
          where: { id: jobId },
          data: { progress: Math.round((processed / targetFiles.length) * 100) },
        })
      } catch (error) {
        console.error(`Error processing file ${filePath}:`, error)
      }
    }

    await prisma.testJob.update({
      where: { id: jobId },
      data: { status: 'completed', completedAt: new Date(), progress: 100 },
    })
  } catch (error) {
    console.error('Error processing test generation:', error)
    await prisma.testJob.update({
      where: { id: jobId },
      data: {
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        completedAt: new Date(),
      },
    })
  }
}

