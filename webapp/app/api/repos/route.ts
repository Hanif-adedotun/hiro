import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { prisma } from '@/lib/db/client'
import { createUserClient } from '@/lib/github/client'
import { getRepositoriesByUserId, createRepository } from '@/lib/db/queries'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const repos = await getRepositoriesByUserId(session.user.id)
    return NextResponse.json({ repositories: repos })
  } catch (error) {
    console.error('Error fetching repositories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch repositories' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { githubUrl, fullName, installationId } = body

    let owner: string
    let repoName: string

    if (fullName && typeof fullName === 'string') {
      const parts = fullName.trim().split('/')
      if (parts.length !== 2) {
        return NextResponse.json(
          { error: 'fullName must be "owner/repo"' },
          { status: 400 }
        )
      }
      ;[owner, repoName] = parts
    } else if (githubUrl) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
      })
      if (!user?.accessToken) {
        return NextResponse.json(
          { error: 'GitHub access token not found' },
          { status: 401 }
        )
      }
      const github = createUserClient(user.accessToken)
      const repoInfo = await github.getRepoInfo(githubUrl)
      owner = repoInfo.owner
      repoName = repoInfo.repo
    } else {
      return NextResponse.json(
        { error: 'Provide either githubUrl or fullName (e.g. "owner/repo")' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user?.accessToken) {
      return NextResponse.json(
        { error: 'GitHub access token not found' },
        { status: 401 }
      )
    }

    const github = createUserClient(user.accessToken)
    const repoData = await github.getRepository(owner, repoName)

    // Check if repository already exists
    const existing = await prisma.repository.findFirst({
      where: { fullName: repoData.full_name },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Repository already exists' },
        { status: 409 }
      )
    }

    // Create repository in database
    const repo = await createRepository({
      githubId: repoData.id,
      name: repoData.name,
      fullName: repoData.full_name,
      owner: repoData.owner.login,
      private: repoData.private,
      defaultBranch: repoData.default_branch,
      language: repoData.language || undefined,
      installationId: installationId ? Number(installationId) : undefined,
      userId: session.user.id,
    })

    return NextResponse.json({ repository: repo }, { status: 201 })
  } catch (error) {
    console.error('Error adding repository:', error)
    return NextResponse.json(
      { error: 'Failed to add repository' },
      { status: 500 }
    )
  }
}

