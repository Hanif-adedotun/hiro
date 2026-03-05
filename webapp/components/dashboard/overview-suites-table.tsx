'use client'

import Link from 'next/link'

type Job = {
  id: string
  status: string
  createdAt: Date
  startedAt: Date | null
  completedAt: Date | null
  repository: { fullName: string; name: string }
  testResults: { id: string }[]
}

export function OverviewSuitesTable({ jobs }: { jobs: Job[] }) {
  const duration = (job: Job) => {
    if (!job.startedAt || !job.completedAt) return '—'
    const ms =
      new Date(job.completedAt).getTime() - new Date(job.startedAt).getTime()
    return `${(ms / 1000).toFixed(1)}s`
  }

  const statusLabel = (status: string) => {
    if (status === 'completed') return 'passed'
    if (status === 'failed') return 'failed'
    return status
  }

  const relativeTime = (date: Date) => {
    const d = new Date(date)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)
    if (diffMins < 60) return `${diffMins} minutes ago`
    if (diffHours < 24) return `${diffHours} hours ago`
    if (diffDays < 7) return `${diffDays} days ago`
    return d.toLocaleDateString()
  }

  if (jobs.length === 0) {
    return (
      <div className="px-4 py-12 text-center text-muted-foreground text-sm">
        No test suites yet. Generate tests from the Run Tests page.
      </div>
    )
  }

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-border">
          <th className="text-left px-4 py-3 font-medium text-foreground">
            Suite Name
          </th>
          <th className="text-left px-4 py-3 font-medium text-foreground">
            Tests
          </th>
          <th className="text-left px-4 py-3 font-medium text-foreground">
            Status
          </th>
          <th className="text-left px-4 py-3 font-medium text-foreground">
            Duration
          </th>
          <th className="text-left px-4 py-3 font-medium text-foreground">
            Last Run
          </th>
          <th className="text-left px-4 py-3 font-medium text-foreground">
            Actions
          </th>
        </tr>
      </thead>
      <tbody>
        {jobs.map((job) => {
          const passed = job.status === 'completed' ? job.testResults.length : 0
          const failed = job.status === 'failed' ? 1 : 0
          const total = job.testResults.length
          const isPassed = job.status === 'completed'
          const isFailed = job.status === 'failed'
          return (
            <tr key={job.id} className="border-b border-border last:border-0">
              <td className="px-4 py-3">
                <div className="flex items-center gap-2 text-foreground">
                  <span className="text-muted-foreground">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                  </span>
                  {job.repository.fullName}
                </div>
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                <span>{total} total</span>
                <span className="ml-2 inline-flex gap-1 flex-wrap">
                  {passed > 0 && (
                    <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                      {passed} passed
                    </span>
                  )}
                  {failed > 0 && (
                    <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900/30 dark:text-red-400">
                      {failed} failed
                    </span>
                  )}
                </span>
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                    isPassed
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                      : isFailed
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {statusLabel(job.status)}
                </span>
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {duration(job)}
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {relativeTime(job.createdAt)}
              </td>
              <td className="px-4 py-3">
                <Link
                  href={`/unit-tests?jobId=${job.id}`}
                  className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground hover:bg-accent"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Run
                </Link>
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
