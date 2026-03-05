import { getSession } from '@/lib/auth/session'
import { getRepositoriesByUserId } from '@/lib/db/queries'
import VibeScoreDashboard from '@/components/dashboard/vibe-score'

export default async function AnalyticsPage() {
  const session = await getSession()
  if (!session?.user?.id) return null

  const repos = await getRepositoriesByUserId(session.user.id)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Analytics
        </h1>
        <p className="mt-2 text-muted-foreground">
          Code quality metrics and test coverage trends across your repositories.
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-foreground mb-2">Vibe Code Score</h2>
        <p className="text-sm text-muted-foreground mb-4">Code quality metrics and trends.</p>
        <VibeScoreDashboard repositories={repos} />
      </div>
    </div>
  )
}
