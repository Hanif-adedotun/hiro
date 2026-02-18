import { prisma } from './client'

// User queries
export async function getUserByGitHubId(githubId: string) {
  return prisma.user.findUnique({
    where: { githubId },
  })
}

export async function createUser(data: {
  githubId: string
  username: string
  email?: string
  avatarUrl?: string
  accessToken?: string
}) {
  return prisma.user.create({
    data,
  })
}

export async function updateUser(githubId: string, data: {
  username?: string
  email?: string
  avatarUrl?: string
  accessToken?: string
}) {
  return prisma.user.update({
    where: { githubId },
    data,
  })
}

// Repository queries
export async function getRepositoryByFullName(fullName: string) {
  return prisma.repository.findFirst({
    where: { fullName },
  })
}

export async function getRepositoriesByUserId(userId: string) {
  return prisma.repository.findMany({
    where: { userId, enabled: true },
    orderBy: { updatedAt: 'desc' },
  })
}

export async function createRepository(data: {
  githubId: number
  name: string
  fullName: string
  owner: string
  private: boolean
  defaultBranch: string
  language?: string
  installationId?: number
  userId?: string
}) {
  return prisma.repository.create({
    data,
  })
}

// Installation queries
export async function getInstallationByInstallationId(installationId: number) {
  return prisma.installation.findUnique({
    where: { installationId },
  })
}

export async function createInstallation(data: {
  installationId: number
  accountId: string
  accountType: string
  accountLogin: string
  userId?: string
}) {
  return prisma.installation.create({
    data,
  })
}

// Pull Request queries
export async function getPullRequest(repositoryId: string, prNumber: number) {
  return prisma.pullRequest.findUnique({
    where: {
      repositoryId_prNumber: {
        repositoryId,
        prNumber,
      },
    },
  })
}

export async function createPullRequest(data: {
  prNumber: number
  repositoryId: string
  title: string
  state: string
  headSha: string
  baseSha: string
  author: string
  changedFiles: string[]
  additions: number
  deletions: number
}) {
  return prisma.pullRequest.create({
    data,
  })
}

export async function updatePullRequestAnalysis(
  repositoryId: string,
  prNumber: number,
  data: {
    analysisStatus: string
    hasTests?: boolean
    testCoverage?: number
    riskLevel?: string
    suggestions?: any
    hiroCommentId?: number
    hiroPRId?: number
    analyzedAt?: Date
  }
) {
  return prisma.pullRequest.update({
    where: {
      repositoryId_prNumber: {
        repositoryId,
        prNumber,
      },
    },
    data,
  })
}

// Test Job queries
export async function createTestJob(data: {
  repositoryId: string
  pullRequestId?: string
  jobType: string
  targetFiles: string[]
  metadata?: any
}) {
  return prisma.testJob.create({
    data,
  })
}

export async function getTestJob(id: string) {
  return prisma.testJob.findUnique({
    where: { id },
    include: {
      repository: true,
      pullRequest: true,
      testResults: true,
    },
  })
}

export async function updateTestJob(
  id: string,
  data: {
    status?: string
    progress?: number
    errorMessage?: string
    metadata?: any
    startedAt?: Date
    completedAt?: Date
  }
) {
  return prisma.testJob.update({
    where: { id },
    data,
  })
}

export async function getPendingTestJobs(limit: number = 10) {
  return prisma.testJob.findMany({
    where: { status: 'pending' },
    orderBy: { createdAt: 'asc' },
    take: limit,
    include: {
      repository: true,
    },
  })
}

// Test Result queries
export async function createTestResult(data: {
  jobId: string
  repositoryId: string
  filePath: string
  testFilePath: string
  testCode: string
  metadata: string
  requiredPackages: string[]
  testFramework?: string
  coverage?: number
}) {
  return prisma.testResult.create({
    data,
  })
}

// Coverage Snapshot queries
export async function createCoverageSnapshot(data: {
  repositoryId: string
  overallCoverage: number
  fileCoverage: any
  totalFiles: number
  testedFiles: number
}) {
  return prisma.coverageSnapshot.create({
    data,
  })
}

export async function getLatestCoverageSnapshot(repositoryId: string) {
  return prisma.coverageSnapshot.findFirst({
    where: { repositoryId },
    orderBy: { createdAt: 'desc' },
  })
}

// Action Feed queries
export async function createActionFeed(data: {
  repositoryId: string
  actionType: string
  title: string
  description?: string
  prNumber?: number
  prUrl?: string
  riskLevel?: string
  coverageImpact?: number
  metadata?: any
}) {
  return prisma.actionFeed.create({
    data,
  })
}

export async function getActionFeed(repositoryId: string, limit: number = 50) {
  return prisma.actionFeed.findMany({
    where: { repositoryId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
}

