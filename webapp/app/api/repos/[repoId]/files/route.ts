import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { prisma } from '@/lib/db/client'
import { createUserClient, createAppClient } from '@/lib/github/client'

async function getGitHubClientForRepo(repoId: string, userId: string) {
  const repo = await prisma.repository.findUnique({
    where: { id: repoId },
    include: { user: true, installation: true },
  })
  if (!repo || repo.userId !== userId) return null
  if (repo.installationId && repo.installation) {
    const appId = process.env.GITHUB_APP_ID
    const privateKey = process.env.GITHUB_APP_PRIVATE_KEY
    if (!appId || !privateKey) return null
    return createAppClient(appId, privateKey, repo.installation.installationId)
  }
  if (repo.user?.accessToken) {
    return createUserClient(repo.user.accessToken)
  }
  return null
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ repoId: string }> }
) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { repoId } = await params
    const { searchParams } = new URL(request.url)
    const folder = searchParams.get('folder') ?? ''

    const repo = await prisma.repository.findUnique({
      where: { id: repoId },
    })
    if (!repo || repo.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const github = await getGitHubClientForRepo(repoId, session.user.id)
    if (!github) {
      return NextResponse.json(
        { error: 'No GitHub access for this repository' },
        { status: 400 }
      )
    }

    const filePaths = await github.getFilePathsUnderFolder(
      repo.owner,
      repo.name,
      folder
    )
    return NextResponse.json({ files: filePaths })
  } catch (error) {
    console.error('Error fetching files:', error)
    return NextResponse.json(
      { error: 'Failed to fetch file list' },
      { status: 500 }
    )
  }
}
