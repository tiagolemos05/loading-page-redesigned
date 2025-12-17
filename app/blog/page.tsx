import { Metadata } from 'next'
import Link from 'next/link'
import { getAllPosts, formatDate } from '@/lib/blog'
import { BlogHeader } from '@/components/blog-header'

export const metadata: Metadata = {
  title: 'Blog - Node Wave',
  description: 'Learn about AI automation, workflow optimization, and how to streamline your business operations.',
}

export default function BlogPage() {
  const posts = getAllPosts()

  return (
    <div className="min-h-screen bg-background">
      <BlogHeader />
      
      <main className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-16">
          <h1 className="text-foreground text-4xl md:text-5xl font-semibold mb-4">
            Blog
          </h1>
          <p className="text-muted-foreground text-lg">
            Insights on AI automation and optimizing business operations.
          </p>
        </div>

        {posts.length === 0 ? (
          <p className="text-muted-foreground">No posts yet. Check back soon.</p>
        ) : (
          <div className="flex flex-col">
            {posts.map((post, index) => (
              <article key={post.slug}>
                <Link 
                  href={`/blog/${post.slug}`}
                  className="group block py-8"
                >
                  <time className="text-muted-foreground text-sm mb-2 block">
                    {formatDate(post.date)}
                  </time>
                  <h2 className="text-foreground text-xl md:text-2xl font-medium mb-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {post.description}
                  </p>
                </Link>
                {index < posts.length - 1 && (
                  <div className="border-b border-foreground/[0.06]" />
                )}
              </article>
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-foreground/[0.06] py-8">
        <div className="max-w-3xl mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
            ← Back to Node Wave
          </Link>
          <Link href="/#contact-section" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
            Get in touch
          </Link>
        </div>
      </footer>
    </div>
  )
}
