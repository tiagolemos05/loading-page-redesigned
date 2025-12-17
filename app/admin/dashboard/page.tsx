'use client'

import { useEffect, useState } from 'react'
import { supabase, Post } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AdminDashboard() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
    fetchPosts()
  }, [])

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/admin')
    } else {
      setUser(user)
    }
  }

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })

    if (data) {
      setPosts(data)
    }
    setLoading(false)
  }

  const togglePublish = async (post: Post) => {
    const updates: any = { draft: !post.draft }
    if (post.draft) {
      updates.published_at = new Date().toISOString()
    }

    const { error } = await supabase
      .from('posts')
      .update(updates)
      .eq('id', post.id)

    if (!error) {
      fetchPosts()
    }
  }

  const deletePost = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id)

    if (!error) {
      fetchPosts()
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="w-full py-6 px-6">
        <div className="w-full max-w-[1320px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-3 group">
              <span className="text-foreground text-xl font-semibold">Node Wave</span>
            </Link>
            <span className="text-foreground/20">/</span>
            <span className="text-muted-foreground">Admin</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-muted-foreground text-sm">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 flex-1 w-full">
        <div className="py-16">
          <div className="mb-16 flex items-center justify-between">
            <div>
              <h1 className="text-foreground text-4xl md:text-5xl font-semibold mb-4">
                Posts
              </h1>
              <p className="text-muted-foreground text-lg">
                {posts.filter(p => p.draft).length} drafts, {posts.filter(p => !p.draft).length} published
              </p>
            </div>
          </div>

          {posts.length === 0 ? (
            <p className="text-muted-foreground">No posts yet.</p>
          ) : (
            <div className="flex flex-col">
              {posts.map((post, index) => (
                <article key={post.id}>
                  <div className="py-8">
                    <div className="flex items-center gap-3 mb-2">
                      <span
                        className={`px-2 py-0.5 text-xs rounded ${
                          post.draft
                            ? 'bg-yellow-500/20 text-yellow-500'
                            : 'bg-green-500/20 text-green-500'
                        }`}
                      >
                        {post.draft ? 'Draft' : 'Published'}
                      </span>
                      <span className="text-muted-foreground text-sm">
                        {post.reading_time} min read
                      </span>
                    </div>
                    <h2 className="text-foreground text-xl md:text-2xl font-medium mb-2">
                      {post.title}
                    </h2>
                    <p className="text-muted-foreground leading-relaxed mb-3">
                      {post.description}
                    </p>
                    <p className="text-muted-foreground/50 text-sm mb-4">
                      /{post.slug} · Created {new Date(post.created_at).toLocaleDateString()}
                    </p>
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/blog/${post.slug}`}
                        target="_blank"
                        className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground border border-foreground/[0.06] rounded transition-colors"
                      >
                        Preview
                      </Link>
                      <Link
                        href={`/admin/edit/${post.id}`}
                        className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground border border-foreground/[0.06] rounded transition-colors"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => togglePublish(post)}
                        className={`px-3 py-1.5 text-sm rounded transition-colors ${
                          post.draft
                            ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                            : 'border border-foreground/[0.06] text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {post.draft ? 'Publish' : 'Unpublish'}
                      </button>
                      <button
                        onClick={() => deletePost(post.id)}
                        className="px-3 py-1.5 text-sm text-red-500 hover:bg-red-500/10 rounded transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  {index < posts.length - 1 && (
                    <div className="border-b border-foreground/[0.06]" />
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="py-8">
        <div className="max-w-[1320px] mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
            ← Back to Node Wave
          </Link>
          <Link href="/blog" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
            View blog
          </Link>
        </div>
      </footer>
    </div>
  )
}
