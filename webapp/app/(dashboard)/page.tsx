import { getSession } from '@/lib/auth/session'
import { getRepositoriesByUserId, getActionFeed } from '@/lib/db/queries'
import { prisma } from '@/lib/db/client'
import RepoCard from '@/components/dashboard/repo-card'
import MetricsCard from '@/components/dashboard/metrics-card'
import ActivityFeed from '@/components/dashboard/activity-feed'

export default async function DashboardPage() {
  const session = await getSession()
  
  if (!session?.user?.id) {
    return null
  }

  const repos = await getRepositoriesByUserId(session.user.id)
  
  // Get latest activity across all repos
  const allActions = await prisma.actionFeed.findMany({
    where: {
      repository: {
        userId: session.user.id,
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: {
      repository: true,
    },
  })

  // Calculate metrics
  const totalRepos = repos.length
  const activeRepos = repos.filter(r => r.enabled).length
  
  const [totalJobs, completedJobs, totalPRs, totalTestResults] = await Promise.all([
    prisma.testJob.count({
      where: {
        repository: {
          userId: session.user.id,
        },
      },
    }),
    prisma.testJob.count({
      where: {
        repository: {
          userId: session.user.id,
        },
        status: 'completed',
      },
    }),
    prisma.pullRequest.count({
      where: {
        repository: {
          userId: session.user.id,
        },
      },
    }),
    prisma.testResult.count({
      where: {
        repository: {
          userId: session.user.id,
        },
      },
    }),
  ])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Overview of your repositories and test generation activity
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricsCard
          title="Total Repositories"
          value={totalRepos.toString()}
          description={`${activeRepos} active`}
        />
        <MetricsCard
          title="Test Jobs"
          value={totalJobs.toString()}
          description={`${completedJobs} completed`}
        />
        <MetricsCard
          title="Pull Requests"
          value={totalPRs.toString()}
          description="Analyzed"
        />
        <MetricsCard
          title="Test Results"
          value={totalTestResults.toString()}
          description="Generated"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Repositories</h2>
          <div className="space-y-4">
            {repos.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <p className="text-gray-500">No repositories yet</p>
                <p className="text-sm text-gray-400 mt-2">
                  Add a repository to get started
                </p>
              </div>
            ) : (
              repos.map((repo) => (
                <RepoCard key={repo.id} repository={repo} />
              ))
            )}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <ActivityFeed actions={allActions} />
        </div>
      </div>
    </div>
  )
}

