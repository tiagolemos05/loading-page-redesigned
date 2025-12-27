import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Known AI crawler user agent patterns
const AI_CRAWLERS = [
  { pattern: /GPTBot/i, name: 'GPTBot' },
  { pattern: /ChatGPT-User/i, name: 'ChatGPT-User' },
  { pattern: /ClaudeBot/i, name: 'ClaudeBot' },
  { pattern: /Anthropic-ai/i, name: 'Anthropic-ai' },
  { pattern: /Claude-Web/i, name: 'Claude-Web' },
  { pattern: /PerplexityBot/i, name: 'PerplexityBot' },
  { pattern: /Bytespider/i, name: 'Bytespider' },
  { pattern: /cohere-ai/i, name: 'Cohere' },
  { pattern: /YouBot/i, name: 'YouBot' },
  { pattern: /Google-Extended/i, name: 'Google-Extended' },
  { pattern: /CCBot/i, name: 'CCBot' },
  { pattern: /FacebookBot/i, name: 'FacebookBot' },
  { pattern: /Applebot-Extended/i, name: 'Applebot-Extended' },
]

function detectAICrawler(userAgent: string): { name: string; userAgent: string } | null {
  for (const crawler of AI_CRAWLERS) {
    if (crawler.pattern.test(userAgent)) {
      return { name: crawler.name, userAgent }
    }
  }
  return null
}

export async function middleware(request: NextRequest) {
  const userAgent = request.headers.get('user-agent') || ''
  const crawler = detectAICrawler(userAgent)

  // Only log AI crawlers, let the request continue
  if (crawler) {
    const path = request.nextUrl.pathname
    
    // Extract slug if it's a blog post
    const blogMatch = path.match(/^\/blog\/([^\/]+)$/)
    const slug = blogMatch ? blogMatch[1] : null

    // Log to Supabase asynchronously (don't block the response)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (supabaseUrl && supabaseServiceKey) {
      // Fire and forget - don't await
      fetch(`${supabaseUrl}/rest/v1/ai_crawls`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({
          crawler_name: crawler.name,
          user_agent: crawler.userAgent,
          slug: slug,
          path: path,
          status_code: 200,
        }),
      }).catch(() => {
        // Silently fail - don't break the site if logging fails
      })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Match all paths except static files and api routes we don't want to track
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2)).*)',
  ],
}
