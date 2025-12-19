'use client'

import Link from 'next/link'
import { getVisitorIdClient, isExcluded } from './page-tracker'

interface CTALinkProps {
  slug: string
  href: string
  children: React.ReactNode
  className?: string
}

export function CTALink({ slug, href, children, className }: CTALinkProps) {
  const handleClick = async () => {
    if (isExcluded()) return

    const visitorId = getVisitorIdClient()
    if (!visitorId) return

    try {
      await fetch('/api/track-cta', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          visitor_id: visitorId,
          slug,
        }),
      })
    } catch (error) {
      console.error('Failed to track CTA click:', error)
    }
  }

  return (
    <Link 
      href={href}
      onClick={handleClick}
      className={className}
    >
      {children}
    </Link>
  )
}
