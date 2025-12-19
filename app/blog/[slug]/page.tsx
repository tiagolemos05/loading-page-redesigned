import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getPostBySlug, getAllPosts, formatDate } from '@/lib/blog'
import { BlogHeader, BlogBackLink, CopyUrlButton, ReadingTime } from '@/components/blog-header'
import { PageTracker } from '@/components/page-tracker'
import { BlogCTABox } from '@/components/blog-cta-box'
import { BlogFooter } from '@/components/blog-footer'

interface PageProps {
  params: Promise<{ slug: string }>
}

const BASE_URL = 'https://www.nodewave.io'

export const revalidate = 60

export async function generateStaticParams() {
  // Skip static generation if env vars not available (build time)
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return []
  }
  const posts = await getAllPosts()
  return posts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return { title: 'Blog - Node Wave' }
  }
  
  const { slug } = await params
  const post = await getPostBySlug(slug)
  
  if (!post) {
    return { title: 'Post Not Found' }
  }

  const postUrl = `${BASE_URL}/blog/${post.slug}`

  return {
    title: post.meta_title || `${post.title} - Node Wave Blog`,
    description: post.description || '',
    authors: post.author ? [{ name: post.author }] : undefined,
    keywords: post.tags?.length ? post.tags : undefined,
    openGraph: {
      type: 'article',
      url: postUrl,
      title: post.title,
      description: post.description || '',
      publishedTime: post.published_at || post.created_at,
      modifiedTime: post.updated_at,
      authors: post.author ? [post.author] : undefined,
      tags: post.tags,
      siteName: 'Node Wave',
    },
    twitter: {
      card: 'summary',
      title: post.title,
      description: post.description || '',
    },
    alternates: {
      canonical: postUrl,
    },
  }
}

function generateArticleJsonLd(post: {
  title: string
  description: string | null
  author: string
  slug: string
  published_at: string | null
  updated_at: string
  created_at: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description || '',
    author: {
      '@type': 'Organization',
      name: post.author || 'Node Wave',
      url: BASE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Node Wave',
      url: BASE_URL,
    },
    datePublished: post.published_at || post.created_at,
    dateModified: post.updated_at,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${BASE_URL}/blog/${post.slug}`,
    },
  }
}

function ContentGrid() {
  return (
    <div className="absolute inset-0 pointer-events-none hidden md:block overflow-visible" style={{ left: '-80px', right: '-80px' }}>
      {/* Vertical grid lines */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, hsl(var(--foreground) / 0.06) 1px, transparent 1px)
          `,
          backgroundSize: '33.333% 100%',
          backgroundPosition: 'left',
        }}
      />
      {/* Right edge vertical line */}
      <div className="absolute top-0 bottom-0 right-0 w-px bg-foreground/[0.06]" />
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

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post || post.draft) {
    notFound()
  }

  const jsonLd = generateArticleJsonLd(post)

  return (
    <div className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PageTracker slug={slug} />
      <BlogHeader />
      
      <main className="max-w-3xl mx-auto px-6">
        {/* Content area with grid */}
        <div className="relative pt-16 pb-16">
          <ContentGrid />
          
          {/* Back link */}
          <div className="mb-8 relative z-10">
            <BlogBackLink />
          </div>
          
          {/* Header */}
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

          {/* Meta row */}
          <div className="relative py-4 mb-12 z-10">
            <div className="absolute top-0 h-px bg-foreground/[0.06]" style={{ left: '-80px', right: '-80px' }} />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <ReadingTime minutes={post.reading_time || 1} />
                <CopyUrlButton />
              </div>
              <time 
                className="text-muted-foreground text-sm"
                dateTime={new Date(post.published_at || post.created_at).toISOString()}
              >
                {formatDate(post.published_at || post.created_at)}
              </time>
            </div>
          </div>

          {/* Description as lead paragraph */}
          {post.description && (
            <p className="text-muted-foreground text-lg md:text-xl leading-relaxed mb-8 relative z-10">
              {post.description}
            </p>
          )}

          {/* Article content */}
          <article className="relative z-10">
            <div 
              className="prose prose-invert prose-lg max-w-none
                prose-headings:text-foreground prose-headings:font-semibold
                prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4
                prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
                prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:mb-6
                prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                prose-strong:text-foreground prose-strong:font-semibold
                prose-code:text-primary prose-code:bg-foreground/[0.05] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:before:content-none prose-code:after:content-none
                prose-pre:bg-foreground/[0.03] prose-pre:border prose-pre:border-foreground/[0.06] prose-pre:rounded-lg
                prose-ul:text-muted-foreground prose-ol:text-muted-foreground
                prose-li:marker:text-primary/50
                prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground prose-blockquote:italic"
              dangerouslySetInnerHTML={{ __html: post.contentHtml }}
            />
          </article>

          {/* CTA box */}
          <div className="mt-16 relative z-10">
            <BlogCTABox slug={slug} />
          </div>
        </div>
      </main>

      <BlogFooter slug={slug} />
    </div>
  )
}
