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
      <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{repository.name}</h3>
            <p className="text-sm text-gray-500 mt-1">{repository.fullName}</p>
          </div>
          <div className="flex items-center space-x-2">
            {repository.language && (
              <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                {repository.language}
              </span>
            )}
            <span
              className={`px-2 py-1 text-xs font-medium rounded ${
                repository.enabled
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {repository.enabled ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
        {repository.autoGenerateTests && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <span className="text-xs text-gray-500">Auto-generate tests enabled</span>
          </div>
        )}
      </div>
    </Link>
  )
}

