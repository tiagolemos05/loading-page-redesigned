'use client'

import Link from 'next/link'
import { CTALink } from './cta-link'

interface BlogFooterProps {
  slug: string
}

export function BlogFooter({ slug }: BlogFooterProps) {
  return (
    <footer className="py-8">
      <div className="max-w-[1320px] mx-auto px-6 flex items-center justify-between">
        <Link href="/blog" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
          ← Back to blog
        </Link>
        <CTALink 
          slug={slug}
          href="/#contact-section" 
          className="text-muted-foreground hover:text-foreground text-sm transition-colors"
        >
          Get in touch
        </CTALink>
      </div>
    </footer>
  )
}
