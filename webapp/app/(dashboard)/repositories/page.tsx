import { getSession } from '@/lib/auth/session'
import { getRepositoriesByUserId } from '@/lib/db/queries'
import RepoCard from '@/components/dashboard/repo-card'

export default async function RepositoriesPage() {
  const session = await getSession()
  if (!session?.user?.id) return null

  const repos = await getRepositoriesByUserId(session.user.id)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Repositories
        </h1>
        <p className="mt-2 text-muted-foreground">
          Repositories connected to Hiro. Enable or disable testing per repository.
        </p>
      </div>

      <div className="space-y-4">
        {repos.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center shadow-sm">
            <p className="text-muted-foreground">No repositories yet</p>
            <p className="mt-2 text-sm text-muted-foreground/80">
              Connect a repository from Settings to get started.
            </p>
          </div>
        ) : (
          repos.map((repo) => (
            <RepoCard key={repo.id} repository={repo} />
          ))
        )}
      </div>
    </div>
  )
}
