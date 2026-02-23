import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { prisma } from '@/lib/db/client'
import { createUserClient } from '@/lib/github/client'

/** List repositories the signed-in user has access to on GitHub (OAuth scope). */
export async function GET() {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user?.accessToken) {
      return NextResponse.json(
        { error: 'GitHub token not found. Sign out and sign in again with GitHub.' },
        { status: 401 }
      )
    }

    const github = createUserClient(user.accessToken)
    const repos = await github.listRepositoriesForAuthenticatedUser({ perPage: 100 })

    const list = repos.map((r: { id: number; full_name: string; name: string; owner: { login: string }; private: boolean; default_branch: string }) => ({
      id: r.id,
      fullName: r.full_name,
      name: r.name,
      owner: r.owner.login,
      private: r.private,
      defaultBranch: r.default_branch,
    }))

    return NextResponse.json({ repositories: list })
  } catch (error) {
    console.error('Error listing GitHub repositories:', error)
    return NextResponse.json(
      { error: 'Failed to list repositories from GitHub' },
      { status: 500 }
    )
  }
}
