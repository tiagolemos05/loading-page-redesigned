import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'

function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200
  const wordCount = content.trim().split(/\s+/).length
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute))
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

async function verifyAuth(request: NextRequest): Promise<boolean> {
  const authHeader = request.headers.get('authorization')
  if (!authHeader) return false

  const token = authHeader.replace('Bearer ', '')
  
  // Check if it's the API key
  if (token === process.env.API_SECRET_KEY) {
    return true
  }

  // Check if it's a valid Supabase session token
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { data: { user }, error } = await supabase.auth.getUser(token)
    return !error && !!user
  } catch {
    return false
  }
}

export async function POST(request: NextRequest) {
  // Verify auth (API key or Supabase session)
  const isAuthorized = await verifyAuth(request)
  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabaseAdmin = getSupabaseAdmin()
    const body = await request.json()
    const { title, description, content, author, tags, slug: customSlug, reading_time: customReadingTime, meta_title, focus_keyword } = body

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      )
    }

    const slug = customSlug || generateSlug(title)
    const reading_time = customReadingTime || calculateReadingTime(content)

    const { data, error } = await supabaseAdmin
      .from('posts')
      .insert({
        slug,
        title,
        description: description || null,
        content,
        author: author || 'Node Wave',
        reading_time,
        tags: tags || [],
        draft: true,
        meta_title: meta_title || null,
        focus_keyword: focus_keyword || null,
      })
      .select()
      .single()

    if (error) {
      // Handle duplicate slug
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'A post with this slug already exists' },
          { status: 409 }
        )
      }
      throw error
    }

    return NextResponse.json({ success: true, post: data }, { status: 201 })
  } catch (error) {
    console.error('Error creating post:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
