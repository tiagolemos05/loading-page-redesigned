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
      .select('slug, title')
      .eq('draft', false)

    if (postsError) {
      console.error('Posts error:', postsError)
      throw postsError
    }

    const publishedSlugs = (publishedPosts || []).map(p => p.slug)

    // Get AI analytics counts via RPC
    const { data: counts, error: countsError } = await supabaseAdmin
      .rpc('get_ai_analytics_counts', {
        start_date: startDateStr,
        slug_list: publishedSlugs
      })

    if (countsError) {
      console.error('AI Counts RPC error:', countsError)
      throw countsError
    }

    // Get daily AI data via RPC
    const { data: dailyRpcData, error: dailyError } = await supabaseAdmin
      .rpc('get_daily_ai_analytics', {
        start_date: startDateStr,
        slug_list: publishedSlugs
      })

    if (dailyError) {
      console.error('Daily AI RPC error:', dailyError)
      throw dailyError
    }

    // Initialize all days in range
    const dailyCrawls: Record<string, { crawls: number; gptbot: number; claudebot: number; perplexitybot: number; other: number }> = {}
    for (let i = 0; i <= days; i++) {
      const date = new Date()
      date.setDate(date.getDate() - (days - i))
      const dateStr = date.toISOString().split('T')[0]
      dailyCrawls[dateStr] = { crawls: 0, gptbot: 0, claudebot: 0, perplexitybot: 0, other: 0 }
    }

    // Merge RPC data
    if (dailyRpcData && Array.isArray(dailyRpcData)) {
      dailyRpcData.forEach((day: any) => {
        const dateStr = day.date
        if (dailyCrawls[dateStr]) {
          dailyCrawls[dateStr] = {
            crawls: day.crawls || 0,
            gptbot: day.gptbot || 0,
            claudebot: day.claudebot || 0,
            perplexitybot: day.perplexitybot || 0,
            other: day.other || 0,
          }
        }
      })
    }

    const dailyData = Object.entries(dailyCrawls).map(([date, data]) => ({
      date,
      ...data,
    }))

    // Get crawler breakdown
    const { data: crawlerData, error: crawlerError } = await supabaseAdmin
      .rpc('get_ai_crawler_counts', {
        start_date: startDateStr
      })

    if (crawlerError) {
      console.error('Crawler counts error:', crawlerError)
    }

    const crawlers = (crawlerData || []).map((c: any) => ({
      name: c.crawler_name,
      count: c.crawl_count,
    }))

    // Get top crawled articles
    const { data: articleData, error: articleError } = await supabaseAdmin
      .from('ai_crawls')
      .select('slug')
      .gte('created_at', startDateStr)
      .not('slug', 'is', null)

    if (articleError) {
      console.error('Article crawls error:', articleError)
    }

    // Count crawls per slug
    const slugCounts: Record<string, number> = {}
    ;(articleData || []).forEach((row: any) => {
      if (row.slug) {
        slugCounts[row.slug] = (slugCounts[row.slug] || 0) + 1
      }
    })

    // Map to articles with titles
    const topArticles = (publishedPosts || [])
      .map(post => ({
        slug: post.slug,
        title: post.title,
        crawls: slugCounts[post.slug] || 0,
      }))
      .filter(a => a.crawls > 0)
      .sort((a, b) => b.crawls - a.crawls)

    // Get top crawled paths (non-blog)
    const { data: pathData, error: pathError } = await supabaseAdmin
      .from('ai_crawls')
      .select('path')
      .gte('created_at', startDateStr)
      .is('slug', null)

    if (pathError) {
      console.error('Path crawls error:', pathError)
    }

    const pathCounts: Record<string, number> = {}
    ;(pathData || []).forEach((row: any) => {
      pathCounts[row.path] = (pathCounts[row.path] || 0) + 1
    })

    const topPaths = Object.entries(pathCounts)
      .map(([path, count]) => ({ path, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    return NextResponse.json({
      dailyData,
      crawlers,
      topArticles,
      topPaths,
      summary: {
        totalCrawls: counts?.[0]?.total_crawls ?? 0,
        uniqueCrawlers: counts?.[0]?.unique_crawlers ?? 0,
        blogCrawls: counts?.[0]?.blog_crawls ?? 0,
        successfulCrawls: counts?.[0]?.successful_crawls ?? 0,
      },
    })
  } catch (error) {
    console.error('Error in AI analytics endpoint:', error)
    return NextResponse.json({ error: 'Internal server error', details: String(error) }, { status: 500 })
  }
}
