import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { visitor_id, slug, referrer } = body

    if (!visitor_id || !slug) {
      return NextResponse.json(
        { error: 'visitor_id and slug are required' },
        { status: 400 }
      )
    }

    const supabaseAdmin = getSupabaseAdmin()

    // Clean up referrer - extract domain only
    let referrer_domain: string | null = null
    if (referrer && referrer !== '' && referrer !== 'direct') {
      try {
        const url = new URL(referrer)
        referrer_domain = url.hostname.replace('www.', '')
      } catch {
        referrer_domain = referrer
      }
    }

    const { error } = await supabaseAdmin
      .from('page_views')
      .insert({
        visitor_id,
        slug,
        referrer: referrer_domain,
      })

    if (error) {
      console.error('Error tracking page view:', error)
      return NextResponse.json(
        { error: 'Failed to track page view' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in track endpoint:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
