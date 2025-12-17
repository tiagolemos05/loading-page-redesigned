import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

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

export async function POST(request: NextRequest) {
  // Verify API key
  const authHeader = request.headers.get('authorization')
  const apiKey = process.env.API_SECRET_KEY

  if (!authHeader || authHeader !== `Bearer ${apiKey}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabaseAdmin = getSupabaseAdmin()
    const body = await request.json()
    const { title, description, content, author, tags, slug: customSlug, reading_time: customReadingTime } = body

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
