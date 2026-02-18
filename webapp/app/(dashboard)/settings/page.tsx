import { getSession } from '@/lib/auth/session'
import { getRepositoriesByUserId } from '@/lib/db/queries'
import SettingsPanel from '@/components/dashboard/settings-panel'

export default async function SettingsPage() {
  const session = await getSession()
  
  if (!session?.user?.id) {
    return null
  }

  const repos = await getRepositoriesByUserId(session.user.id)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="mt-2 text-gray-600">
          Configure GitHub App and automation settings
        </p>
      </div>

      <SettingsPanel repositories={repos} />
    </div>
  )
}

