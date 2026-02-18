import { getSession } from '@/lib/auth/session'
import { getRepositoriesByUserId } from '@/lib/db/queries'
import VibeScoreDashboard from '@/components/dashboard/vibe-score'

export default async function VibeScorePage() {
  const session = await getSession()
  
  if (!session?.user?.id) {
    return null
  }

  const repos = await getRepositoriesByUserId(session.user.id)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Vibe Code Score</h1>
        <p className="mt-2 text-gray-600">
          Code quality metrics and trends
        </p>
      </div>

      <VibeScoreDashboard repositories={repos} />
    </div>
  )
}

