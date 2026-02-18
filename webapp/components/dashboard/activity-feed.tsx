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
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <p className="text-gray-500 text-sm">No recent activity</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="space-y-4">
        {actions.map((action) => (
          <div key={action.id} className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{action.title}</p>
                {action.description && (
                  <p className="text-xs text-gray-500 mt-1">{action.description}</p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  {action.repository.name} • {new Date(action.createdAt).toLocaleDateString()}
                </p>
              </div>
              <span
                className={`px-2 py-1 text-xs font-medium rounded ${
                  action.actionType === 'pr_opened' || action.actionType === 'pr_merged'
                    ? 'bg-green-100 text-green-800'
                    : action.actionType === 'pr_rejected'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-blue-100 text-blue-800'
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

