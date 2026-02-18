import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { prisma } from '@/lib/db/client'

export async function GET(
  request: NextRequest,
  { params }: { params: { repoId: string } }
) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const repo = await prisma.repository.findUnique({
      where: { id: params.repoId },
      include: {
        testJobs: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        pullRequests: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!repo) {
      return NextResponse.json({ error: 'Repository not found' }, { status: 404 })
    }

    // Check if user owns this repo
    if (repo.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({ repository: repo })
  } catch (error) {
    console.error('Error fetching repository:', error)
    return NextResponse.json(
      { error: 'Failed to fetch repository' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { repoId: string } }
) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const repo = await prisma.repository.findUnique({
      where: { id: params.repoId },
    })

    if (!repo || repo.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const updated = await prisma.repository.update({
      where: { id: params.repoId },
      data: {
        enabled: body.enabled !== undefined ? body.enabled : repo.enabled,
        autoGenerateTests: body.autoGenerateTests !== undefined ? body.autoGenerateTests : repo.autoGenerateTests,
        maxPRsPerDay: body.maxPRsPerDay !== undefined ? body.maxPRsPerDay : repo.maxPRsPerDay,
        protectedDirs: body.protectedDirs !== undefined ? body.protectedDirs : repo.protectedDirs,
        onlyChangedFiles: body.onlyChangedFiles !== undefined ? body.onlyChangedFiles : repo.onlyChangedFiles,
      },
    })

    return NextResponse.json({ repository: updated })
  } catch (error) {
    console.error('Error updating repository:', error)
    return NextResponse.json(
      { error: 'Failed to update repository' },
      { status: 500 }
    )
  }
}

