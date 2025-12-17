import { getSupabase, getSupabaseAdmin, Post } from './supabase'
import { remark } from 'remark'
import html from 'remark-html'

export type { Post }

export interface PostWithHtml extends Post {
  contentHtml: string
}

export async function getAllPosts(includeDrafts = false): Promise<Post[]> {
  const client = includeDrafts ? getSupabaseAdmin() : getSupabase()
  
  let query = client
    .from('posts')
    .select('*')
    .order('published_at', { ascending: false, nullsFirst: false })

  if (!includeDrafts) {
    query = query.eq('draft', false)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching posts:', error)
    return []
  }

  return data || []
}

export async function getPostBySlug(slug: string, includeDrafts = false): Promise<PostWithHtml | null> {
  const client = includeDrafts ? getSupabaseAdmin() : getSupabase()
  
  const { data, error } = await client
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error || !data) {
    return null
  }

  if (!includeDrafts && data.draft) {
    return null
  }

  // Convert markdown to HTML
  const processedContent = await remark()
    .use(html)
    .process(data.content)
  const contentHtml = processedContent.toString()

  return {
    ...data,
    contentHtml,
  }
}

export async function getAllPostSlugs(): Promise<string[]> {
  const client = getSupabase()
  
  const { data, error } = await client
    .from('posts')
    .select('slug')
    .eq('draft', false)

  if (error || !data) {
    return []
  }

  return data.map((post) => post.slug)
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200
  const wordCount = content.trim().split(/\s+/).length
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute))
}
