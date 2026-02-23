interface ActivityFeedProps {
  actions: Array<{
    id: string
    actionType: string
    title: string
    description: string | null
    createdAt: Date
    repository: {
      name: string
    }
  }>
}

export default function ActivityFeed({ actions }: ActivityFeedProps) {
  if (actions.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 text-center shadow-sm">
        <p className="text-sm text-muted-foreground">No recent activity</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="space-y-4">
        {actions.map((action) => (
          <div key={action.id} className="border-b border-border pb-4 last:border-0 last:pb-0">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">{action.title}</p>
                {action.description && (
                  <p className="mt-1 text-xs text-muted-foreground">{action.description}</p>
                )}
                <p className="mt-1 text-xs text-muted-foreground/80">
                  {action.repository.name} • {new Date(action.createdAt).toLocaleDateString()}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-md px-2 py-1 text-xs font-medium ${
                  action.actionType === 'pr_opened' || action.actionType === 'pr_merged'
                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                    : action.actionType === 'pr_rejected'
                    ? 'bg-destructive/10 text-destructive'
                    : 'bg-primary/10 text-primary'
                }`}
              >
                {action.actionType.replace('_', ' ')}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

