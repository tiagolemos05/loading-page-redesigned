'use client'

import { CTALink } from './cta-link'

interface BlogCTABoxProps {
  slug: string
}

export function BlogCTABox({ slug }: BlogCTABoxProps) {
  return (
    <div className="bg-foreground/[0.02] border border-foreground/[0.06] rounded-xl p-8">
      <h3 className="text-foreground text-xl font-semibold mb-2">
        Ready to automate your workflows?
      </h3>
      <p className="text-muted-foreground mb-4">
        Let&apos;s discuss how we can streamline your business operations.
      </p>
      <CTALink 
        slug={slug}
        href="/#contact-section"
        className="inline-flex items-center text-primary hover:underline font-medium"
      >
        Get in touch →
      </CTALink>
    </div>
  )
}
