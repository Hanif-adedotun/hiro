import { getSession } from '@/lib/auth/session'
import { getRepositoriesByUserId } from '@/lib/db/queries'
import { prisma } from '@/lib/db/client'
import CoverageMap from '@/components/dashboard/coverage-map'
import RiskAnalysis from '@/components/dashboard/risk-analysis'

export default async function TestIntelligencePage() {
  const session = await getSession()
  
  if (!session?.user?.id) {
    return null
  }

  const repos = await getRepositoriesByUserId(session.user.id)

  // Get coverage data for all repos
  const coverageData = await Promise.all(
    repos.map(async (repo) => {
      const latestCoverage = await prisma.coverageSnapshot.findFirst({
        where: { repositoryId: repo.id },
        orderBy: { createdAt: 'desc' },
      })

      const testResults = await prisma.testResult.findMany({
        where: { repositoryId: repo.id },
        select: { filePath: true },
        distinct: ['filePath'],
      })

      return {
        repository: repo,
        coverage: latestCoverage,
        testedFiles: testResults.length,
      }
    })
  )

  // Get risky PRs
  const riskyPRs = await prisma.pullRequest.findMany({
    where: {
      repositoryId: { in: repos.map(r => r.id) },
      riskLevel: { in: ['high', 'medium'] },
      state: 'open',
    },
    include: {
      repository: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Test Intelligence</h1>
        <p className="mt-2 text-gray-600">
          Coverage analysis and risk assessment across your repositories
        </p>
      </div>

      <CoverageMap data={coverageData} />
      <RiskAnalysis riskyPRs={riskyPRs} />
    </div>
  )
}

