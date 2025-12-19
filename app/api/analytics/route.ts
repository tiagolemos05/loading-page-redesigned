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
    // Get all published post slugs first
    const { data: publishedPosts } = await supabaseAdmin
      .from('posts')
      .select('slug, title, author')
      .eq('draft', false)

    const publishedSlugs = new Set((publishedPosts || []).map(p => p.slug))

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

    // Filter views to only include published posts (not blog overview)
    const views = (pageViews || []).filter(view => publishedSlugs.has(view.slug))
    
    // Get blog overview views separately
    const blogViews = (pageViews || []).filter(view => view.slug === 'blog')

    // Get all CTA clicks within the time range
    const { data: ctaClicks, error: ctaError } = await supabaseAdmin
      .from('cta_clicks')
      .select('*')
      .gte('created_at', startDateStr)

    if (ctaError) {
      console.error('Error fetching CTA clicks:', ctaError)
    }

    // Filter CTA clicks to only include published posts
    const clicks = (ctaClicks || []).filter(click => publishedSlugs.has(click.slug))

    // Create a map of slug to author
    const slugToAuthor: Record<string, string> = {}
    ;(publishedPosts || []).forEach(post => {
      slugToAuthor[post.slug] = post.author || 'Node Wave'
    })

    // 1. Daily views for line chart - split by author
    const dailyViews: Record<string, { 
      total: number
      unique: Set<string>
      tiago: number
      vicente: number
    }> = {}
    
    // Initialize all days in range
    for (let i = 0; i <= days; i++) {
      const date = new Date()
      date.setDate(date.getDate() - (days - i))
      const dateStr = date.toISOString().split('T')[0]
      dailyViews[dateStr] = { total: 0, unique: new Set(), tiago: 0, vicente: 0 }
    }

    views.forEach(view => {
      const dateStr = new Date(view.created_at).toISOString().split('T')[0]
      if (dailyViews[dateStr] && view.slug !== 'blog') {
        dailyViews[dateStr].total++
        dailyViews[dateStr].unique.add(view.visitor_id)
        
        const author = slugToAuthor[view.slug] || 'Node Wave'
        if (author === 'Tiago') {
          dailyViews[dateStr].tiago++
        } else if (author === 'Vicente') {
          dailyViews[dateStr].vicente++
        }
      }
    })

    const dailyData = Object.entries(dailyViews).map(([date, data]) => ({
      date,
      views: data.total,
      visitors: data.unique.size,
      tiago: data.tiago,
      vicente: data.vicente,
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

    // 3. Top articles - include all published posts
    const articleMap: Record<string, number> = {}
    views.forEach(view => {
      // Skip the blog overview page for article rankings
      if (view.slug !== 'blog') {
        articleMap[view.slug] = (articleMap[view.slug] || 0) + 1
      }
    })

    // Count CTA clicks per article
    const ctaMap: Record<string, number> = {}
    clicks.forEach(click => {
      ctaMap[click.slug] = (ctaMap[click.slug] || 0) + 1
    })

    // Build topArticles from all published posts, merging view counts
    const topArticles = (publishedPosts || []).map(post => ({
      slug: post.slug,
      title: post.title,
      views: articleMap[post.slug] || 0,
      clicks: ctaMap[post.slug] || 0,
      author: post.author || 'Node Wave',
    })).sort((a, b) => b.views - a.views)

    // 4. Summary stats - only count article views, not blog overview
    const totalViews = views.length
    const uniqueVisitors = new Set(views.map(v => v.visitor_id)).size
    // Only count blog overview views if there are published posts
    const blogOverviewViews = publishedSlugs.size > 0 ? blogViews.length : 0
    const totalCtaClicks = clicks.length

    return NextResponse.json({
      dailyData,
      sources,
      topArticles,
      summary: {
        totalViews,
        uniqueVisitors,
        blogOverviewViews,
        totalCtaClicks,
      },
    })
  } catch (error) {
    console.error('Error in analytics endpoint:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
