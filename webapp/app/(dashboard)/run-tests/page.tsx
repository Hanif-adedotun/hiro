import { getSession } from '@/lib/auth/session'
import { getRepositoriesByUserId } from '@/lib/db/queries'
import RunTestsForm from '@/components/dashboard/run-tests-form'
import Link from 'next/link'

export default async function RunTestsPage() {
  const session = await getSession()
  if (!session?.user?.id) return null

  const repos = await getRepositoriesByUserId(session.user.id)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Run Tests</h1>
        <p className="mt-2 text-muted-foreground">
          Select a repository and folder, then generate AI tests. Results are saved in the system.
        </p>
      </div>

      {repos.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center shadow-sm">
          <p className="text-muted-foreground">No repositories yet</p>
          <p className="mt-2 text-sm text-muted-foreground/80">
            <Link href="/settings" className="text-primary hover:underline">
              Add a repository
            </Link>{' '}
            to get started.
          </p>
        </div>
      ) : (
        <RunTestsForm
          repos={repos.map((r) => ({ id: r.id, name: r.name, fullName: r.fullName }))}
        />
      )}
    </div>
  )
}
