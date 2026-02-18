import { getSession } from '@/lib/auth/session'
import { getActionFeed } from '@/lib/db/queries'
import { prisma } from '@/lib/db/client'
import ActionFeed from '@/components/dashboard/activity-feed'

export default async function ActionsPage() {
  const session = await getSession()
  
  if (!session?.user?.id) {
    return null
  }

  const allActions = await prisma.actionFeed.findMany({
    where: {
      repository: {
        userId: session.user.id,
      },
    },
    orderBy: { createdAt: 'desc' },
    include: {
      repository: true,
    },
  })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Autonomous Actions Feed</h1>
        <p className="mt-2 text-gray-600">
          Chronological log of all actions taken by Hiro
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <ActionFeed actions={allActions} />
      </div>
    </div>
  )
}

