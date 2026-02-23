"use client"

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type Job = {
  id: string
  status: string
  progress: number
  jobType?: string
  suggestedPrId: string | null
  suggestedPrUrl: string | null
  createdAt: Date
  startedAt: Date | null
  completedAt: Date | null
  repository: { fullName: string; name: string }
  testResults: { id: string }[]
}

export function UnitTestsTable({
  jobs,
  selectedJobId,
}: {
  jobs: Job[]
  selectedJobId: string | null
}) {
  const router = useRouter()
  const [acceptingId, setAcceptingId] = useState<string | null>(null)

  const duration = (job: Job) => {
    if (!job.startedAt || !job.completedAt) return '—'
    const ms =
      new Date(job.completedAt).getTime() - new Date(job.startedAt).getTime()
    return `${(ms / 1000).toFixed(1)}s`
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
            Suite / Repository
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
            Last run
          </th>
          <th className="text-left px-4 py-3 font-medium text-foreground">
            Actions
          </th>
        </tr>
      </thead>
      <tbody>
        {jobs.map((job) => (
          <tr key={job.id} className="border-b border-border last:border-0">
            <td className="px-4 py-3 text-foreground">
              {job.repository.fullName}
            </td>
            <td className="px-4 py-3 text-muted-foreground">
              {job.testResults.length}
            </td>
            <td className="px-4 py-3">
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                  job.status === 'pr_created'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                    : job.status === 'completed'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                      : job.status === 'failed'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                }`}
              >
                {job.status}
              </span>
            </td>
            <td className="px-4 py-3 text-muted-foreground">
              {duration(job)}
            </td>
            <td className="px-4 py-3 text-muted-foreground">
              {new Date(job.createdAt).toLocaleString()}
            </td>
            <td className="px-4 py-3 flex items-center gap-2">
              <Link
                href={`/unit-tests?jobId=${job.id}`}
                className="text-primary hover:underline"
              >
                View
              </Link>
              {job.status === 'completed' && !job.suggestedPrUrl && job.testResults.length > 0 && (
                <button
                  type="button"
                  disabled={acceptingId === job.id}
                  onClick={async () => {
                    setAcceptingId(job.id)
                    try {
                      const res = await fetch(`/api/jobs/${job.id}/accept`, {
                        method: 'POST',
                      })
                      const data = await res.json().catch(() => ({}))
                      if (res.ok) {
                        router.refresh()
                        if (data.prUrl) window.open(data.prUrl, '_blank')
                      } else {
                        alert(data.error || 'Failed to create PR')
                      }
                    } finally {
                      setAcceptingId(null)
                    }
                  }}
                  className="text-sm text-primary hover:underline disabled:opacity-50"
                >
                  {acceptingId === job.id ? 'Creating PR…' : 'Accept → Create PR'}
                </button>
              )}
              {job.suggestedPrUrl && (
                <a
                  href={job.suggestedPrUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  Open PR
                </a>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
