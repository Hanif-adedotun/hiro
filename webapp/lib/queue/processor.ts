import { prisma } from '@/lib/db/client'
import { getPendingTestJobs, updateTestJob } from '@/lib/db/queries'
import { createUserClient, createAppClient } from '@/lib/github/client'
import { createGroqLLM } from '@/lib/llm/groq'
import { createTestResult } from '@/lib/db/queries'

export interface JobProcessor {
  processJob(jobId: string): Promise<void>
  processPendingJobs(limit?: number): Promise<number>
}

export class TestGenerationProcessor implements JobProcessor {
  async processJob(jobId: string): Promise<void> {
    const job = await prisma.testJob.findUnique({
      where: { id: jobId },
      include: {
        repository: {
          include: {
            user: true,
            installation: true,
          },
        },
      },
    })

    if (!job) {
      throw new Error(`Job ${jobId} not found`)
    }

    if (job.status !== 'pending') {
      return // Job already processed or processing
    }

    // Update status to processing
    await updateTestJob(jobId, {
      status: 'processing',
      startedAt: new Date(),
    })

    try {
      const repo = job.repository
      
      // Get GitHub client
      let github
      if (repo.installationId && repo.installation) {
        // Use GitHub App authentication
        const appId = process.env.GITHUB_APP_ID!
        const privateKey = process.env.GITHUB_APP_PRIVATE_KEY!
        github = createAppClient(appId, privateKey, repo.installation.installationId)
      } else if (repo.user?.accessToken) {
        // Use user token
        github = createUserClient(repo.user.accessToken)
      } else {
        throw new Error('No authentication method available for repository')
      }

      // Initialize LLM
      const llm = createGroqLLM()

      // Get repository tree
      const treeData = await github.getRepoTree(repo.owner, repo.name)
      const treeString = JSON.stringify(treeData.tree, null, 2)

      // Get repository structure for context
      const { fullContext } = await github.getRepositoryStructure(repo.owner, repo.name)
      const fullContextString = fullContext.join('\n')

      // Process each target file
      let processed = 0
      const totalFiles = job.targetFiles.length

      for (const filePath of job.targetFiles) {
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
            repositoryId: repo.id,
            filePath,
            testFilePath,
            testCode: result.code,
            metadata: result.metadata,
            requiredPackages: result.packages,
          })

          processed++
          const progress = Math.round((processed / totalFiles) * 100)
          await updateTestJob(jobId, { progress })
        } catch (error) {
          console.error(`Error processing file ${filePath} in job ${jobId}:`, error)
          // Continue with next file
        }
      }

      // Mark job as completed
      await updateTestJob(jobId, {
        status: 'completed',
        completedAt: new Date(),
        progress: 100,
      })
    } catch (error) {
      console.error(`Error processing job ${jobId}:`, error)
      await updateTestJob(jobId, {
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        completedAt: new Date(),
      })
      throw error
    }
  }

  async processPendingJobs(limit: number = 10): Promise<number> {
    const jobs = await getPendingTestJobs(limit)
    let processed = 0

    for (const job of jobs) {
      try {
        await this.processJob(job.id)
        processed++
      } catch (error) {
        console.error(`Failed to process job ${job.id}:`, error)
        // Continue with next job
      }
    }

    return processed
  }
}

// Singleton instance
let processorInstance: TestGenerationProcessor | null = null

export function getJobProcessor(): TestGenerationProcessor {
  if (!processorInstance) {
    processorInstance = new TestGenerationProcessor()
  }
  return processorInstance
}

