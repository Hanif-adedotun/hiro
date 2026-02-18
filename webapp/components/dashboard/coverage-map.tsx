"use client"

interface CoverageMapProps {
  data: Array<{
    repository: {
      id: string
      name: string
      fullName: string
    }
    coverage: {
      overallCoverage: number
      fileCoverage: any
      totalFiles: number
      testedFiles: number
    } | null
    testedFiles: number
  }>
}

export default function CoverageMap({ data }: CoverageMapProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Coverage Map</h2>
      <div className="space-y-4">
        {data.map((item) => (
          <div key={item.repository.id} className="border-b border-gray-200 pb-4 last:border-0">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="font-medium text-gray-900">{item.repository.name}</h3>
                <p className="text-sm text-gray-500">{item.repository.fullName}</p>
              </div>
              <div className="text-right">
                {item.coverage ? (
                  <>
                    <p className="text-2xl font-bold text-gray-900">
                      {item.coverage.overallCoverage.toFixed(1)}%
                    </p>
                    <p className="text-xs text-gray-500">
                      {item.coverage.testedFiles} / {item.coverage.totalFiles} files
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-gray-500">No coverage data</p>
                )}
              </div>
            </div>
            {item.coverage && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${item.coverage.overallCoverage}%` }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

