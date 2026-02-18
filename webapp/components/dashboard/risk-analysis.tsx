interface RiskAnalysisProps {
  riskyPRs: Array<{
    id: string
    title: string
    prNumber: number
    riskLevel: string | null
    additions: number
    deletions: number
    repository: {
      name: string
    }
  }>
}

export default function RiskAnalysis({ riskyPRs }: RiskAnalysisProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Risk Analysis</h2>
      <div className="space-y-4">
        {riskyPRs.length === 0 ? (
          <p className="text-gray-500 text-sm">No high-risk pull requests</p>
        ) : (
          riskyPRs.map((pr) => (
            <div key={pr.id} className="border-b border-gray-200 pb-4 last:border-0">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">{pr.title}</h3>
                  <p className="text-sm text-gray-500">
                    {pr.repository.name} • PR #{pr.prNumber}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 text-sm font-medium rounded ${
                    pr.riskLevel === 'high'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {pr.riskLevel} risk
                </span>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                <span>+{pr.additions}</span> / <span>-{pr.deletions}</span> changes
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
