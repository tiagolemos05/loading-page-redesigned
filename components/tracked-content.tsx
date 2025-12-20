'use client'

import { useEffect, useRef, useMemo } from 'react'
import { getVisitorIdClient, isExcluded } from './page-tracker'
import { BlogChart } from './blog-chart'
import type { ChartConfig } from '@/lib/chart-schemas'

const TRACKED_URLS = [
  'nodewave.io/#contact-section',
  '/#contact-section',
  '#contact-section',
  'cal.com/tiago-lemos-p1wrn8/30min',
]

interface TrackedContentProps {
  slug: string
  html: string
  charts?: unknown[] | null
  className?: string
}

interface ContentSegment {
  type: 'html' | 'chart'
  content: string | number // HTML string or chart index
}

function parseContentWithCharts(html: string): ContentSegment[] {
  const segments: ContentSegment[] = []
  const markerRegex = /\{\{chart:(\d+)\}\}/g
  let lastIndex = 0
  let match

  while ((match = markerRegex.exec(html)) !== null) {
    // Add HTML before this marker
    if (match.index > lastIndex) {
      segments.push({
        type: 'html',
        content: html.slice(lastIndex, match.index)
      })
    }
    
    // Add chart marker
    segments.push({
      type: 'chart',
      content: parseInt(match[1], 10)
    })
    
    lastIndex = match.index + match[0].length
  }

  // Add remaining HTML after last marker
  if (lastIndex < html.length) {
    segments.push({
      type: 'html',
      content: html.slice(lastIndex)
    })
  }

  return segments
}

export function TrackedContent({ slug, html, charts, className }: TrackedContentProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  
  const segments = useMemo(() => parseContentWithCharts(html), [html])
  const chartConfigs = useMemo(() => (charts || []) as ChartConfig[], [charts])

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

  // If no charts or no markers, render simple HTML
  if (!chartConfigs.length || segments.length === 1) {
    return (
      <div 
        ref={containerRef}
        className={className}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    )
  }

  return (
    <div ref={containerRef} className={className}>
      {segments.map((segment, index) => {
        if (segment.type === 'html') {
          return (
            <div
              key={`html-${index}`}
              dangerouslySetInnerHTML={{ __html: segment.content as string }}
            />
          )
        }
        
        // Chart segment
        const chartIndex = segment.content as number
        const chartConfig = chartConfigs[chartIndex]
        
        if (!chartConfig) {
          return (
            <div 
              key={`chart-${index}`}
              className="my-8 p-4 border border-red-500/20 bg-red-500/5 rounded-lg text-red-400 text-sm"
            >
              Chart {chartIndex} not found
            </div>
          )
        }
        
        return <BlogChart key={`chart-${index}`} config={chartConfig} />
      })}
    </div>
  )
}
