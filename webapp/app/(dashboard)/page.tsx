import { getSession } from '@/lib/auth/session'
import { getRepositoriesByUserId } from '@/lib/db/queries'
import { prisma } from '@/lib/db/client'
import RepoCard from '@/components/dashboard/repo-card'
import MetricsCard from '@/components/dashboard/metrics-card'
import ActivityFeed from '@/components/dashboard/activity-feed'
import Link from 'next/link'

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
    <div className="relative space-y-8">
      {/* Subtle background accent */}
      <div
        className="pointer-events-none fixed -top-40 -right-40 h-80 w-80 rounded-full bg-emerald-500/5 blur-3xl dark:bg-emerald-400/5"
        aria-hidden
      />
      <div
        className="pointer-events-none fixed top-1/2 -left-40 h-72 w-72 rounded-full bg-cyan-500/5 blur-3xl dark:bg-cyan-400/5"
        aria-hidden
      />

      <div className="relative opacity-0 animate-fade-in-up" style={{ animationDelay: "0ms", animationFillMode: "forwards" }}>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Overview</h1>
        <p className="mt-2 text-muted-foreground">
          Monitor your AI-generated test suite performance and GitHub integration status.
        </p>
      </div>

      <div className="relative grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: "80ms", animationFillMode: "forwards" }}>
          <MetricsCard
            title="Total Repositories"
            value={totalRepos.toString()}
            description={`${activeRepos} active`}
          />
        </div>
        <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: "160ms", animationFillMode: "forwards" }}>
          <MetricsCard
            title="Test Jobs"
            value={totalJobs.toString()}
            description={`${completedJobs} completed`}
          />
        </div>
        <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: "240ms", animationFillMode: "forwards" }}>
          <MetricsCard
            title="Pull Requests"
            value={totalPRs.toString()}
            description="Analyzed"
          />
        </div>
        <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: "320ms", animationFillMode: "forwards" }}>
          <MetricsCard
            title="Test Results"
            value={totalTestResults.toString()}
            description="Generated"
          />
        </div>
      </div>

      <div className="relative rounded-lg border border-border bg-card p-6 shadow-sm opacity-0 animate-fade-in-up" style={{ animationDelay: "360ms", animationFillMode: "forwards" }}>
        <h2 className="text-lg font-semibold text-foreground mb-2">Quick Actions</h2>
        <p className="text-sm text-muted-foreground mb-4">AI-powered testing commands.</p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/run-tests"
            className="inline-flex items-center gap-2 rounded-md bg-amber-500 px-4 py-2 text-sm font-medium text-amber-950 hover:bg-amber-600"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
            Generate New Tests
          </Link>
          <Link
            href="/unit-tests"
            className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-accent"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Run All Tests
          </Link>
          <Link
            href="/unit-tests"
            className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-accent"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
            Generate Report
          </Link>
        </div>
      </div>

      <div className="relative grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="mb-4 text-xl font-semibold text-foreground opacity-0 animate-fade-in-up" style={{ animationDelay: "400ms", animationFillMode: "forwards" }}>
            Repositories
          </h2>
          <div className="space-y-4">
            {repos.length === 0 ? (
              <div className="rounded-xl border border-border bg-card p-8 text-center shadow-sm opacity-0 animate-scale-in" style={{ animationDelay: "480ms", animationFillMode: "forwards" }}>
                <p className="text-muted-foreground">No repositories yet</p>
                <p className="mt-2 text-sm text-muted-foreground/80">
                  Add a repository to get started
                </p>
              </div>
            ) : (
              repos.map((repo, i) => (
                <div
                  key={repo.id}
                  className="opacity-0 animate-fade-in-up"
                  style={{ animationDelay: `${480 + i * 50}ms`, animationFillMode: "forwards" }}
                >
                  <RepoCard repository={repo} />
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-xl font-semibold text-foreground opacity-0 animate-fade-in-up" style={{ animationDelay: "450ms", animationFillMode: "forwards" }}>
            Recent Activity
          </h2>
          <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: "500ms", animationFillMode: "forwards" }}>
            <ActivityFeed actions={allActions} />
          </div>
        </div>
      </div>
    </div>
  )
}

