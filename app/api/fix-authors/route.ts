import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    // Get auth header
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify the user is authenticated
    const token = authHeader.split(' ')[1]
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find all posts where author contains "Vicente" but isn't exactly "Vicente"
    const { data: posts, error: fetchError } = await supabaseAdmin
      .from('posts')
      .select('id, author')
      .ilike('author', '%vicente%')
      .neq('author', 'Vicente')

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    if (!posts || posts.length === 0) {
      return NextResponse.json({ message: 'No posts to update', updated: 0 })
    }

    // Update all matching posts to have author = "Vicente"
    const { error: updateError } = await supabaseAdmin
      .from('posts')
      .update({ author: 'Vicente' })
      .ilike('author', '%vicente%')
      .neq('author', 'Vicente')

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ 
      message: `Updated ${posts.length} posts`, 
      updated: posts.length,
      posts: posts.map(p => ({ id: p.id, oldAuthor: p.author }))
    })

  } catch (error) {
    console.error('Fix authors error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
