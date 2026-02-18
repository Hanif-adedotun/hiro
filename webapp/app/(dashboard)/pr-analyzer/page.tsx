import { getSession } from '@/lib/auth/session'
import { getRepositoriesByUserId } from '@/lib/db/queries'
import { prisma } from '@/lib/db/client'
import PRAnalyzer from '@/components/dashboard/pr-analyzer'

export default async function PRAnalyzerPage() {
  const session = await getSession()
  
  if (!session?.user?.id) {
    return null
  }

  const repos = await getRepositoriesByUserId(session.user.id)
  
  const recentPRs = await prisma.pullRequest.findMany({
    where: {
      repository: {
        userId: session.user.id,
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
    include: {
      repository: true,
    },
  })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">PR Analyzer</h1>
        <p className="mt-2 text-gray-600">
          Analyze pull requests and generate test suggestions
        </p>
      </div>

      <PRAnalyzer repositories={repos} pullRequests={recentPRs} />
    </div>
  )
}

