import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { prisma } from '@/lib/db/client'
import { createTestJob, getPendingTestJobs } from '@/lib/db/queries'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const repositoryId = searchParams.get('repositoryId')
    const status = searchParams.get('status')

    const jobs = await prisma.testJob.findMany({
      where: {
        ...(repositoryId && { repositoryId }),
        ...(status && { status }),
        repository: {
          userId: session.user.id,
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        repository: true,
        testResults: true,
      },
    })

    return NextResponse.json({ jobs })
  } catch (error) {
    console.error('Error fetching jobs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch jobs' },
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
    const { repositoryId, jobType, targetFiles, pullRequestId, metadata } = body

    if (!repositoryId || !jobType || !targetFiles) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify repository belongs to user
    const repo = await prisma.repository.findUnique({
      where: { id: repositoryId },
    })

    if (!repo || repo.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const job = await createTestJob({
      repositoryId,
      pullRequestId,
      jobType,
      targetFiles,
      metadata,
    })

    return NextResponse.json({ job }, { status: 201 })
  } catch (error) {
    console.error('Error creating job:', error)
    return NextResponse.json(
      { error: 'Failed to create job' },
      { status: 500 }
    )
  }
}

