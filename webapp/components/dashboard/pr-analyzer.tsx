"use client"

interface PRAnalyzerProps {
  repositories: Array<{
    id: string
    name: string
    fullName: string
  }>
  pullRequests: Array<{
    id: string
    prNumber: number
    title: string
    state: string
    analysisStatus: string
    riskLevel: string | null
    repository: {
      name: string
      fullName: string
    }
  }>
}

export default function PRAnalyzer({ repositories, pullRequests }: PRAnalyzerProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Pull Requests</h2>
        <div className="space-y-4">
          {pullRequests.length === 0 ? (
            <p className="text-gray-500 text-sm">No pull requests found</p>
          ) : (
            pullRequests.map((pr) => (
              <div key={pr.id} className="border-b border-gray-200 pb-4 last:border-0">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{pr.title}</h3>
                    <p className="text-sm text-gray-500">
                      {pr.repository.name} • PR #{pr.prNumber}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${
                        pr.state === 'open'
                          ? 'bg-green-100 text-green-800'
                          : pr.state === 'merged'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {pr.state}
                    </span>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${
                        pr.analysisStatus === 'completed'
                          ? 'bg-blue-100 text-blue-800'
                          : pr.analysisStatus === 'failed'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {pr.analysisStatus}
                    </span>
                    {pr.riskLevel && (
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${
                          pr.riskLevel === 'high'
                            ? 'bg-red-100 text-red-800'
                            : pr.riskLevel === 'medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {pr.riskLevel} risk
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

