'use client'

import { useEffect, useState } from 'react'
import { supabase, Post } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { remark } from 'remark'
import html from 'remark-html'
import gfm from 'remark-gfm'
import { TrackedContent } from '@/components/tracked-content'
import { ThemeToggle } from '@/components/theme-toggle'

function ContentGrid() {
  return (
    <div className="absolute inset-0 pointer-events-none hidden md:block overflow-visible" style={{ left: '-80px', right: '-80px' }}>
      {/* Outer vertical lines (left and right edges) */}
      <div className="absolute top-0 bottom-0 left-0 w-px bg-foreground/[0.06]" />
      <div className="absolute top-0 bottom-0 right-0 w-px bg-foreground/[0.06]" />
      
      {/* Middle vertical lines (hidden) */}
      <div className="absolute top-0 bottom-0 w-px bg-foreground/[0]" style={{ left: '33.333%' }} />
      <div className="absolute top-0 bottom-0 w-px bg-foreground/[0]" style={{ left: '66.666%' }} />
      
      {/* Top horizontal line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-foreground/[0.06]" />
      {/* Bottom horizontal line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-foreground/[0.06]" />
      
      {/* Corner markers - top left */}
      <div className="absolute w-[15px] h-[3px] bg-foreground/30" style={{ top: '-1px', left: '-1px' }} />
      <div className="absolute w-[3px] h-[12px] bg-foreground/30" style={{ top: '2px', left: '-1px' }} />
      
      {/* Corner markers - top right */}
      <div className="absolute w-[15px] h-[3px] bg-foreground/30" style={{ top: '-1px', right: '-1px' }} />
      <div className="absolute w-[3px] h-[12px] bg-foreground/30" style={{ top: '2px', right: '-1px' }} />
      
      {/* Corner markers - bottom left */}
      <div className="absolute w-[15px] h-[3px] bg-foreground/30" style={{ bottom: '-1px', left: '-1px' }} />
      <div className="absolute w-[3px] h-[12px] bg-foreground/30" style={{ bottom: '2px', left: '-1px' }} />
      
      {/* Corner markers - bottom right */}
      <div className="absolute w-[15px] h-[3px] bg-foreground/30" style={{ bottom: '-1px', right: '-1px' }} />
      <div className="absolute w-[3px] h-[12px] bg-foreground/30" style={{ bottom: '2px', right: '-1px' }} />
    </div>
  )
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function AdminPreview() {
  const [post, setPost] = useState<Post | null>(null)
  const [contentHtml, setContentHtml] = useState('')
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const params = useParams()
  const slug = params.slug as string

  useEffect(() => {
    checkAuthAndFetch()
  }, [slug])

  const checkAuthAndFetch = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/admin')
      return
    }

    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('slug', slug)
      .single()

    if (data) {
      setPost(data)
      const processed = await remark().use(gfm).use(html, { sanitize: false }).process(data.content)
      setContentHtml(processed.toString())
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading preview...</p>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Post not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Preview banner */}
      <div className="bg-yellow-500/20 border-b border-yellow-500/30 py-2 px-6">
        <div className="max-w-[1320px] mx-auto flex items-center justify-between">
          <span className="text-yellow-500 text-sm font-medium">
            Preview Mode {post.draft && '(Draft)'}
          </span>
          <Link
            href="/admin/dashboard"
            className="text-yellow-500 hover:text-yellow-400 text-sm transition-colors"
          >
            ← Back to Admin
          </Link>
        </div>
      </div>

      <header className="w-full py-6 px-6">
        <div className="w-full max-w-[1320px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-foreground text-xl font-semibold">Node Wave</span>
            <span className="text-foreground/20">/</span>
            <span className="text-muted-foreground">Blog</span>
          </div>
          <div className="flex items-center gap-6">
            <ThemeToggle />
            <span className="text-muted-foreground text-sm">Get in touch</span>
          </div>
        </div>
      </header>
      
      <main className="max-w-3xl mx-auto px-6">
        <div className="relative pt-16 pb-16">
          <ContentGrid />
          
          <header className="text-center mb-12 relative z-10">
            <h1 className="text-foreground text-3xl md:text-4xl lg:text-5xl font-semibold mb-6 leading-tight">
              {post.title}
            </h1>
            {post.author && (
              <div className="flex items-center justify-center gap-2 mb-8">
                <div className="w-8 h-8 rounded-full bg-foreground/10 flex items-center justify-center text-foreground text-sm font-medium">
                  {post.author.charAt(0)}
                </div>
                <span className="text-muted-foreground text-sm">{post.author}</span>
              </div>
            )}
          </header>

          <div className="relative py-4 mb-12 z-10">
            <div className="absolute top-0 h-px bg-foreground/[0.06]" style={{ left: '-80px', right: '-80px' }} />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="inline-flex items-center gap-1.5 text-muted-foreground text-sm">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  {post.reading_time} min read
                </span>
              </div>
              <time className="text-muted-foreground text-sm">
                {formatDate(post.published_at || post.created_at)}
              </time>
            </div>
          </div>

          <article className="relative z-10">
            <TrackedContent 
              slug={slug}
              html={contentHtml}
              charts={post.charts}
              className="prose prose-invert prose-lg max-w-none
                prose-headings:text-foreground prose-headings:font-semibold
                prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4
                prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
                prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:mb-6
                prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                prose-strong:text-foreground prose-strong:font-semibold
                prose-code:text-primary prose-code:bg-foreground/[0.05] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:before:content-none prose-code:after:content-none
                prose-ul:text-muted-foreground prose-ol:text-muted-foreground
                prose-li:marker:text-primary/50
                prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground prose-blockquote:italic"
            />
          </article>

                    <div className="mt-16 relative z-10">
            <div className="border border-foreground/[0.06] rounded-xl p-8 bg-foreground/[0.02]">
              <h3 className="text-foreground text-xl font-semibold mb-2">
                Ready to automate your workflows?
              </h3>
              <p className="text-muted-foreground mb-4">
                Let&apos;s discuss how we can streamline your business operations.
              </p>
              <span className="inline-flex items-center text-primary font-medium">
                Get in touch →
              </span>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-8">
        <div className="max-w-[1320px] mx-auto px-6 flex items-center justify-between">
          <Link href="/admin/dashboard" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
            ← Back to Admin
          </Link>
          <span className="text-muted-foreground text-sm">Get in touch</span>
        </div>
      </footer>
    </div>
  )
}
