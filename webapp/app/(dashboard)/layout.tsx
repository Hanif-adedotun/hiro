import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { getAllRepositoriesByUserId } from '@/lib/db/queries'
import DashboardSidebar from '@/components/dashboard/sidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  const repositories = await getAllRepositoriesByUserId(session.user.id!)

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar user={session.user} repositories={repositories} />
      <main className="pl-56 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}

