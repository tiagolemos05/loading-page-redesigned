'use client'

import { useEffect, useRef } from 'react'
import { getVisitorIdClient, isExcluded } from './page-tracker'

const TRACKED_URLS = [
  'nodewave.io/#contact-section',
  '/#contact-section',
  '#contact-section',
  'cal.com/tiago-lemos-p1wrn8/30min',
]

interface TrackedContentProps {
  slug: string
  html: string
  className?: string
}

export function TrackedContent({ slug, html, className }: TrackedContentProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleClick = async (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const link = target.closest('a')
      
      if (!link) return

      const href = link.getAttribute('href')
      if (!href) return

      // Check if this is a tracked URL
      const isTracked = TRACKED_URLS.some(url => href.includes(url))

      if (!isTracked) return
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

    container.addEventListener('click', handleClick)
    return () => container.removeEventListener('click', handleClick)
  }, [slug])

  return (
    <div 
      ref={containerRef}
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
