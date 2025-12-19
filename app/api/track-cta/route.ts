import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { visitor_id, slug } = body

    if (!visitor_id || !slug) {
      return NextResponse.json(
        { error: 'visitor_id and slug are required' },
        { status: 400 }
      )
    }

    const supabaseAdmin = getSupabaseAdmin()

    const { error } = await supabaseAdmin
      .from('cta_clicks')
      .insert({
        visitor_id,
        slug,
      })

    if (error) {
      console.error('Error tracking CTA click:', error)
      return NextResponse.json(
        { error: 'Failed to track CTA click' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in track-cta endpoint:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
