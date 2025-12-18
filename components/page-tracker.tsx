'use client'

import { useEffect, useRef } from 'react'

function getVisitorId(): string {
  if (typeof window === 'undefined') return ''
  
  let visitorId = localStorage.getItem('nw_visitor_id')
  if (!visitorId) {
    visitorId = crypto.randomUUID()
    localStorage.setItem('nw_visitor_id', visitorId)
  }
  return visitorId
}

interface PageTrackerProps {
  slug: string
}

export function PageTracker({ slug }: PageTrackerProps) {
  const tracked = useRef(false)

  useEffect(() => {
    if (tracked.current) return
    tracked.current = true

    const trackView = async () => {
      const visitorId = getVisitorId()
      if (!visitorId) return

      const referrer = document.referrer || 'direct'

      try {
        await fetch('/api/track', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            visitor_id: visitorId,
            slug,
            referrer,
          }),
        })
      } catch (error) {
        // Silently fail - don't break the page if tracking fails
        console.error('Failed to track page view:', error)
      }
    }

    trackView()
  }, [slug])

  return null
}
