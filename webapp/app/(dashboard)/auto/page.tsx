import { getSession } from '@/lib/auth/session'
import { prisma } from '@/lib/db/client'
import Link from 'next/link'
import { UnitTestsTable } from '@/components/dashboard/unit-tests-table'

export default async function AutoModePage() {
  const session = await getSession()
  if (!session?.user?.id) return null

  const [reposWithAuto, suggestedJobs] = await Promise.all([
    prisma.repository.findMany({
      where: { userId: session.user.id, enabled: true, autoGenerateTests: true },
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.testJob.findMany({
      where: {
        repository: { userId: session.user.id },
        status: 'completed',
        suggestedPrId: null,
        testResults: { some: {} },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        repository: true,
        testResults: true,
      },
    }),
  ])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Auto mode
        </h1>
        <p className="mt-2 text-muted-foreground">
          Repositories with auto test generation on push/PR and suggested tests
          you can accept to create a PR.
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">
            Repositories with auto mode on
          </h2>
          <p className="text-sm text-muted-foreground">
            Push or PR to the watched branches triggers suggested test
            generation. Configure in Settings.
          </p>
        </div>
        <div className="divide-y divide-border">
          {reposWithAuto.length === 0 ? (
            <div className="px-4 py-8 text-center text-muted-foreground text-sm">
              No repositories have auto mode enabled. Enable &quot;Auto-generate
              tests&quot; and set watched branches in{' '}
              <Link href="/settings" className="text-primary hover:underline">
                Settings
              </Link>
              .
            </div>
          ) : (
            reposWithAuto.map((repo) => (
              <div
                key={repo.id}
                className="px-4 py-3 flex items-center justify-between gap-4"
              >
                <span className="font-medium text-foreground">
                  {repo.fullName}
                </span>
                <span className="text-sm text-muted-foreground">
                  Watched branches:{' '}
                  {(repo.watchedBranches?.length
                    ? repo.watchedBranches
                    : [repo.defaultBranch]
                  ).join(', ')}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">
            Suggested tests
          </h2>
          <p className="text-sm text-muted-foreground">
            Completed jobs with no PR yet. Accept to create a branch and open a
            pull request with the generated tests.
          </p>
        </div>
        <UnitTestsTable jobs={suggestedJobs} selectedJobId={null} />
      </div>
    </div>
  )
}
