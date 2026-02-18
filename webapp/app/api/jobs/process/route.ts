import { NextRequest, NextResponse } from 'next/server'
import { getJobProcessor } from '@/lib/queue/processor'

export async function POST(request: NextRequest) {
  try {
    // In production, add authentication/authorization here
    // For now, we'll allow processing from API calls
    // You might want to add a secret token check

    const body = await request.json()
    const limit = body.limit || 10

    const processor = getJobProcessor()
    const processed = await processor.processPendingJobs(limit)

    return NextResponse.json({
      success: true,
      processed,
      message: `Processed ${processed} job(s)`,
    })
  } catch (error) {
    console.error('Error processing jobs:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// GET endpoint to manually trigger job processing (for testing)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')

    const processor = getJobProcessor()
    const processed = await processor.processPendingJobs(limit)

    return NextResponse.json({
      success: true,
      processed,
      message: `Processed ${processed} job(s)`,
    })
  } catch (error) {
    console.error('Error processing jobs:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

