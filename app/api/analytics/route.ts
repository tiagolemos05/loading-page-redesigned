import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin()
  
  // Check auth - require authenticated user
  const authHeader = request.headers.get('authorization')
  if (!authHeader) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const searchParams = request.nextUrl.searchParams
  const days = parseInt(searchParams.get('days') || '28')
  
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  const startDateStr = startDate.toISOString()

  try {
    // Get all page views within the time range
    const { data: pageViews, error: viewsError } = await supabaseAdmin
      .from('page_views')
      .select('*')
      .gte('created_at', startDateStr)
      .order('created_at', { ascending: true })

    if (viewsError) {
      console.error('Error fetching page views:', viewsError)
      return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
    }

    // Process data for charts
    const views = pageViews || []

    // 1. Daily views for line chart
    const dailyViews: Record<string, { total: number; unique: Set<string> }> = {}
    
    // Initialize all days in range
    for (let i = 0; i <= days; i++) {
      const date = new Date()
      date.setDate(date.getDate() - (days - i))
      const dateStr = date.toISOString().split('T')[0]
      dailyViews[dateStr] = { total: 0, unique: new Set() }
    }

    views.forEach(view => {
      const dateStr = new Date(view.created_at).toISOString().split('T')[0]
      if (dailyViews[dateStr]) {
        dailyViews[dateStr].total++
        dailyViews[dateStr].unique.add(view.visitor_id)
      }
    })

    const dailyData = Object.entries(dailyViews).map(([date, data]) => ({
      date,
      views: data.total,
      visitors: data.unique.size,
    }))

    // 2. Traffic sources
    const sourceMap: Record<string, number> = {}
    views.forEach(view => {
      const source = view.referrer || 'direct'
      sourceMap[source] = (sourceMap[source] || 0) + 1
    })

    const sources = Object.entries(sourceMap)
      .map(([referrer, count]) => ({ referrer: referrer === 'direct' ? null : referrer, count }))
      .sort((a, b) => b.count - a.count)

    // 3. Top articles
    const articleMap: Record<string, number> = {}
    views.forEach(view => {
      // Skip the blog overview page for article rankings
      if (view.slug !== 'blog') {
        articleMap[view.slug] = (articleMap[view.slug] || 0) + 1
      }
    })

    const topArticles = Object.entries(articleMap)
      .map(([slug, views]) => ({ slug, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10)

    // 4. Summary stats
    const totalViews = views.length
    const uniqueVisitors = new Set(views.map(v => v.visitor_id)).size
    const blogOverviewViews = views.filter(v => v.slug === 'blog').length

    return NextResponse.json({
      dailyData,
      sources,
      topArticles,
      summary: {
        totalViews,
        uniqueVisitors,
        blogOverviewViews,
      },
    })
  } catch (error) {
    console.error('Error in analytics endpoint:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
