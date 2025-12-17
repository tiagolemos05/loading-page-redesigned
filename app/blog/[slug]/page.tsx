import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getPostBySlug, getAllPosts, formatDate } from '@/lib/blog'
import { BlogHeader, BlogBackLink } from '@/components/blog-header'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const posts = getAllPosts() // This already filters out drafts
  return posts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  
  if (!post) {
    return { title: 'Post Not Found' }
  }

  return {
    title: `${post.title} - Node Wave Blog`,
    description: post.description,
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post || post.draft) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <BlogHeader />
      
      <main className="max-w-3xl mx-auto px-6 py-16">
        <BlogBackLink />
        
        <article>
          <header className="mb-12">
            <time className="text-muted-foreground text-sm mb-4 block">
              {formatDate(post.date)}
            </time>
            <h1 className="text-foreground text-3xl md:text-4xl lg:text-5xl font-semibold mb-4 leading-tight">
              {post.title}
            </h1>
            {post.description && (
              <p className="text-muted-foreground text-lg md:text-xl leading-relaxed">
                {post.description}
              </p>
            )}
          </header>

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
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>

        <div className="mt-16 pt-8 border-t border-foreground/[0.06]">
          <div className="bg-foreground/[0.02] border border-foreground/[0.06] rounded-xl p-8">
            <h3 className="text-foreground text-xl font-semibold mb-2">
              Ready to automate your workflows?
            </h3>
            <p className="text-muted-foreground mb-4">
              Let&apos;s discuss how we can streamline your business operations.
            </p>
            <Link 
              href="/#contact-section"
              className="inline-flex items-center text-primary hover:underline font-medium"
            >
              Get in touch →
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-foreground/[0.06] py-8">
        <div className="max-w-3xl mx-auto px-6 flex items-center justify-between">
          <Link href="/blog" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
            ← Back to blog
          </Link>
          <Link href="/#contact-section" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
            Get in touch
          </Link>
        </div>
      </footer>
    </div>
  )
}
