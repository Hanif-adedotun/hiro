import Link from 'next/link'

interface RepoCardProps {
  repository: {
    id: string
    name: string
    fullName: string
    language: string | null
    enabled: boolean
    autoGenerateTests: boolean
  }
}

export default function RepoCard({ repository }: RepoCardProps) {
  return (
    <Link href={`/repos/${repository.id}`}>
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-border/80">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">{repository.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{repository.fullName}</p>
          </div>
          <div className="flex items-center gap-2">
            {repository.language && (
              <span className="rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                {repository.language}
              </span>
            )}
            <span
              className={`rounded-md px-2 py-1 text-xs font-medium ${
                repository.enabled
                  ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {repository.enabled ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
        {repository.autoGenerateTests && (
          <div className="mt-4 border-t border-border pt-4">
            <span className="text-xs text-muted-foreground">Auto-generate tests enabled</span>
          </div>
        )}
      </div>
    </Link>
  )
}

