import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin()
  
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
    // Get all published post slugs
    const { data: publishedPosts, error: postsError } = await supabaseAdmin
      .from('posts')
      .select('slug, title, author')
      .eq('draft', false)

    if (postsError) {
      console.error('Posts error:', postsError)
      throw postsError
    }

    const publishedSlugs = (publishedPosts || []).map(p => p.slug)
    console.log('Published slugs:', publishedSlugs.length)

    const slugToAuthor: Record<string, string> = {}
    ;(publishedPosts || []).forEach(post => {
      slugToAuthor[post.slug] = post.author || 'Node Wave'
    })

    // Get counts via RPC
    const { data: counts, error: countsError } = await supabaseAdmin
      .rpc('get_analytics_counts', {
        start_date: startDateStr,
        slug_list: publishedSlugs
      })

    if (countsError) {
      console.error('Counts RPC error:', countsError)
      throw countsError
    }
    console.log('Counts:', counts)

    // Get daily data via RPC
    const { data: dailyRpcData, error: dailyError } = await supabaseAdmin
      .rpc('get_daily_analytics', {
        start_date: startDateStr,
        slug_list: publishedSlugs
      })

    if (dailyError) {
      console.error('Daily RPC error:', dailyError)
      throw dailyError
    }
    console.log('Daily data rows:', dailyRpcData?.length)

    // Initialize all days in range
    const dailyViews: Record<string, { views: number; visitors: number; tiago: number; vicente: number }> = {}
    for (let i = 0; i <= days; i++) {
      const date = new Date()
      date.setDate(date.getDate() - (days - i))
      const dateStr = date.toISOString().split('T')[0]
      dailyViews[dateStr] = { views: 0, visitors: 0, tiago: 0, vicente: 0 }
    }

    // Merge RPC data
    if (dailyRpcData && Array.isArray(dailyRpcData)) {
      dailyRpcData.forEach((day: any) => {
        const dateStr = day.date
        if (dailyViews[dateStr]) {
          dailyViews[dateStr] = {
            views: day.views || 0,
            visitors: day.visitors || 0,
            tiago: day.tiago || 0,
            vicente: day.vicente || 0,
          }
        }
      })
    }

    const dailyData = Object.entries(dailyViews).map(([date, data]) => ({
      date,
      ...data,
    }))

    // For sources - use RPC to avoid row limits
    const { data: sourceData, error: sourceError } = await supabaseAdmin
      .from('page_views')
      .select('referrer')
      .gte('created_at', startDateStr)
      .in('slug', publishedSlugs.length > 0 ? publishedSlugs : ['__none__'])
      .limit(50000)

    if (sourceError) {
      console.error('Source error:', sourceError)
    }

    const sourceMap: Record<string, number> = {}
    ;(sourceData || []).forEach(view => {
      const source = view.referrer || 'direct'
      sourceMap[source] = (sourceMap[source] || 0) + 1
    })

    const sources = Object.entries(sourceMap)
      .map(([referrer, count]) => ({ referrer: referrer === 'direct' ? null : referrer, count }))
      .sort((a, b) => b.count - a.count)

    // Top articles via RPC
    const { data: articleCounts, error: articleError } = await supabaseAdmin
      .rpc('get_article_counts', {
        start_date: startDateStr,
        slug_list: publishedSlugs
      })

    if (articleError) {
      console.error('Article RPC error:', articleError)
    }
    console.log('Article counts:', articleCounts?.length)

    const articleMap: Record<string, number> = {}
    const ctaMap: Record<string, number> = {}
    
    if (articleCounts && Array.isArray(articleCounts)) {
      articleCounts.forEach((a: any) => {
        articleMap[a.slug] = a.views || 0
        ctaMap[a.slug] = a.clicks || 0
      })
    }

    const topArticles = (publishedPosts || []).map(post => ({
      slug: post.slug,
      title: post.title,
      views: articleMap[post.slug] || 0,
      clicks: ctaMap[post.slug] || 0,
      author: post.author || 'Node Wave',
    })).sort((a, b) => b.views - a.views)

    return NextResponse.json({
      dailyData,
      sources,
      topArticles,
      summary: {
        totalViews: counts?.total_views ?? 0,
        uniqueVisitors: counts?.unique_visitors ?? 0,
        blogOverviewViews: counts?.blog_views ?? 0,
        totalCtaClicks: counts?.total_cta_clicks ?? 0,
      },
    })
  } catch (error) {
    console.error('Error in analytics endpoint:', error)
    return NextResponse.json({ error: 'Internal server error', details: String(error) }, { status: 500 })
  }
}
