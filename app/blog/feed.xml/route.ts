import { getAllPosts } from '@/lib/blog'

const BASE_URL = 'https://www.nodewave.io'

export async function GET() {
  const posts = await getAllPosts()

  const itemsXml = posts
    .map(
      (post) => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${BASE_URL}/blog/${post.slug}</link>
      <guid isPermaLink="true">${BASE_URL}/blog/${post.slug}</guid>
      <description><![CDATA[${post.description || ''}]]></description>
      <pubDate>${new Date(post.published_at || post.created_at).toUTCString()}</pubDate>
      ${post.author ? `<author>${post.author}</author>` : ''}
      ${post.tags?.map((tag) => `<category>${tag}</category>`).join('\n      ') || ''}
    </item>`
    )
    .join('')

  const rssFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Node Wave Blog</title>
    <link>${BASE_URL}/blog</link>
    <description>Insights on AI automation and optimizing business operations.</description>
    <language>en-US</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${BASE_URL}/blog/feed.xml" rel="self" type="application/rss+xml"/>
    ${itemsXml}
  </channel>
</rss>`

  return new Response(rssFeed, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate',
    },
  })
}
