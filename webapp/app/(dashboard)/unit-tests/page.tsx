import { getSession } from '@/lib/auth/session'
import { prisma } from '@/lib/db/client'
import Link from 'next/link'
import { UnitTestsTable } from '@/components/dashboard/unit-tests-table'

export default async function UnitTestsPage({
  searchParams,
}: {
  searchParams: Promise<{ jobId?: string }>
}) {
  const session = await getSession()
  if (!session?.user?.id) return null

  const params = await searchParams
  const jobId = params?.jobId

  const jobs = await prisma.testJob.findMany({
    where: { repository: { userId: session.user.id } },
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: {
      repository: true,
      testResults: true,
    },
  })

  const selectedJob = jobId ? jobs.find((j) => j.id === jobId) : null

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Unit Tests
        </h1>
        <p className="mt-2 text-muted-foreground">
          AI-generated test suites created by Hiro. View results and metadata.
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">
            AI-Generated Test Suites
          </h2>
          <p className="text-sm text-muted-foreground">
            Overview of all test suites automatically created by Hiro AI.
          </p>
        </div>
        <UnitTestsTable jobs={jobs} selectedJobId={jobId ?? null} />
      </div>

      {selectedJob && (
        <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              Test results — {selectedJob.repository.fullName}
            </h2>
            <Link
              href="/unit-tests"
              className="text-sm text-primary hover:underline"
            >
              Close
            </Link>
          </div>
          <div className="divide-y divide-border">
            {selectedJob.testResults.length === 0 ? (
              <div className="px-4 py-8 text-center text-muted-foreground text-sm">
                No results yet. Job status: {selectedJob.status}.
              </div>
            ) : (
              selectedJob.testResults.map((tr) => (
                <div key={tr.id} className="px-4 py-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-foreground">
                      {tr.filePath.split('/').pop() ?? tr.filePath}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(tr.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <details className="mt-2">
                    <summary className="text-sm text-muted-foreground cursor-pointer hover:text-foreground">
                      View code & metadata
                    </summary>
                    <pre className="mt-2 p-3 rounded-md bg-muted text-xs overflow-auto max-h-64">
                      {tr.testCode}
                    </pre>
                    <div className="mt-2 text-sm text-muted-foreground prose prose-sm dark:prose-invert max-w-none">
                      {tr.metadata}
                    </div>
                  </details>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
