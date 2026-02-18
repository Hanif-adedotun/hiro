"use client"

interface VibeScoreDashboardProps {
  repositories: Array<{
    id: string
    name: string
    fullName: string
  }>
}

export default function VibeScoreDashboard({ repositories }: VibeScoreDashboardProps) {
  // Placeholder for vibe score calculation
  // In production, this would calculate based on:
  // - Code clarity
  // - Consistency
  // - Complexity
  // - Test coverage
  // - Documentation

  const calculateVibeScore = (repo: typeof repositories[0]) => {
    // Placeholder calculation
    return Math.floor(Math.random() * 40) + 60 // 60-100
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {repositories.map((repo) => {
          const score = calculateVibeScore(repo)
          return (
            <div key={repo.id} className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{repo.name}</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-gray-900">{score}</p>
                  <p className="text-sm text-gray-500">Vibe Score</p>
                </div>
                <div className="w-16 h-16">
                  <svg className="transform -rotate-90" viewBox="0 0 36 36">
                    <circle
                      cx="18"
                      cy="18"
                      r="16"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="2"
                    />
                    <circle
                      cx="18"
                      cy="18"
                      r="16"
                      fill="none"
                      stroke={score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444'}
                      strokeWidth="2"
                      strokeDasharray={`${score}, 100`}
                    />
                  </svg>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

