import { NextRequest, NextResponse } from 'next/server'
import { getRelease } from '@/lib/discogs'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const release = await getRelease(id)
    return NextResponse.json(release)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Release not found'
    return NextResponse.json({ error: message }, { status: 404 })
  }
}
