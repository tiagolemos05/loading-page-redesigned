'use client'

import { useEffect, useState } from 'react'
import { supabase, Post } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function EditPost() {
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  useEffect(() => {
    checkAuth()
    fetchPost()
  }, [id])

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/admin')
    }
  }

  const fetchPost = async () => {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .single()

    if (data) {
      setPost(data)
    }
    setLoading(false)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!post) return

    setSaving(true)

    const { error } = await supabase
      .from('posts')
      .update({
        title: post.title,
        slug: post.slug,
        description: post.description,
        content: post.content,
        author: post.author,
        tags: post.tags,
        meta_title: post.meta_title,
        focus_keyword: post.focus_keyword,
      })
      .eq('id', id)

    setSaving(false)

    if (!error) {
      router.push('/admin/dashboard')
    }
  }

  if (loading || !post) {
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
            <Link href="/admin/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
              Admin
            </Link>
            <span className="text-foreground/20">/</span>
            <span className="text-muted-foreground">Edit</span>
          </div>
          <Link 
            href={`/blog/${post.slug}`}
            target="_blank"
            className="text-muted-foreground hover:text-foreground text-sm transition-colors"
          >
            Preview post
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 flex-1 w-full">
        <div className="py-16">
          <div className="mb-8">
            <Link 
              href="/admin/dashboard" 
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to posts
            </Link>
          </div>

          <h1 className="text-foreground text-3xl md:text-4xl font-semibold mb-12">
            Edit Post
          </h1>

          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <label className="block text-muted-foreground text-sm mb-2">Title</label>
              <input
                type="text"
                value={post.title}
                onChange={(e) => setPost({ ...post, title: e.target.value })}
                className="w-full px-4 py-3 bg-foreground/[0.03] border border-foreground/[0.06] rounded-lg text-foreground focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <div>
              <label className="block text-muted-foreground text-sm mb-2">Slug</label>
              <input
                type="text"
                value={post.slug}
                onChange={(e) => setPost({ ...post, slug: e.target.value })}
                className="w-full px-4 py-3 bg-foreground/[0.03] border border-foreground/[0.06] rounded-lg text-foreground focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <div>
              <label className="block text-muted-foreground text-sm mb-2">Description</label>
              <textarea
                value={post.description || ''}
                onChange={(e) => setPost({ ...post, description: e.target.value })}
                rows={2}
                className="w-full px-4 py-3 bg-foreground/[0.03] border border-foreground/[0.06] rounded-lg text-foreground focus:outline-none focus:border-primary transition-colors resize-none"
              />
            </div>

            <div>
              <label className="block text-muted-foreground text-sm mb-2">Meta Title (SEO)</label>
              <input
                type="text"
                value={post.meta_title || ''}
                onChange={(e) => setPost({ ...post, meta_title: e.target.value })}
                placeholder="Leave empty to use post title"
                className="w-full px-4 py-3 bg-foreground/[0.03] border border-foreground/[0.06] rounded-lg text-foreground focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <div>
              <label className="block text-muted-foreground text-sm mb-2">Focus Keyword</label>
              <input
                type="text"
                value={post.focus_keyword || ''}
                onChange={(e) => setPost({ ...post, focus_keyword: e.target.value })}
                placeholder="Primary keyword for SEO"
                className="w-full px-4 py-3 bg-foreground/[0.03] border border-foreground/[0.06] rounded-lg text-foreground focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <div>
              <label className="block text-muted-foreground text-sm mb-2">Content (Markdown)</label>
              <textarea
                value={post.content}
                onChange={(e) => setPost({ ...post, content: e.target.value })}
                rows={20}
                className="w-full px-4 py-3 bg-foreground/[0.03] border border-foreground/[0.06] rounded-lg text-foreground focus:outline-none focus:border-primary transition-colors font-mono text-sm resize-none"
              />
            </div>

            <div>
              <label className="block text-muted-foreground text-sm mb-2">Author</label>
              <input
                type="text"
                value={post.author}
                onChange={(e) => setPost({ ...post, author: e.target.value })}
                className="w-full px-4 py-3 bg-foreground/[0.03] border border-foreground/[0.06] rounded-lg text-foreground focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <div className="flex justify-end gap-4 pt-6">
              <button
                type="button"
                onClick={() => router.push('/admin/dashboard')}
                className="px-6 py-3 text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </main>

      <footer className="py-8">
        <div className="max-w-[1320px] mx-auto px-6 flex items-center justify-between">
          <Link href="/admin/dashboard" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
            ← Back to posts
          </Link>
          <Link href="/blog" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
            View blog
          </Link>
        </div>
      </footer>
    </div>
  )
}
