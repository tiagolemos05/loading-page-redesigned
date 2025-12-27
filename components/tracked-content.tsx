'use client'

import { useEffect, useRef, useMemo } from 'react'
import { getVisitorIdClient, isExcluded } from './page-tracker'
import { BlogChart } from './blog-chart'
import { ROICalculator } from './roi-calculator'
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
  type: 'html' | 'chart' | 'roi-calculator'
  content: string | number // HTML string or chart index
}

function parseContentWithCharts(html: string): ContentSegment[] {
  const segments: ContentSegment[] = []
  // Match both chart markers and roi-calculator marker
  const markerRegex = /\{\{(chart:(\d+)|roi-calculator)\}\}/g
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
    
    // Determine marker type
    if (match[1] === 'roi-calculator') {
      segments.push({
        type: 'roi-calculator',
        content: ''
      })
    } else {
      // Chart marker
      segments.push({
        type: 'chart',
        content: parseInt(match[2], 10)
      })
    }
    
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

  // Wrap tables in scrollable container for mobile
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const tables = container.querySelectorAll('table')
    tables.forEach((table) => {
      // Skip if already wrapped
      if (table.parentElement?.classList.contains('table-wrapper')) return
      
      const wrapper = document.createElement('div')
      wrapper.className = 'table-wrapper'
      table.parentNode?.insertBefore(wrapper, table)
      wrapper.appendChild(table)
      
      // Handle scroll indicator
      const handleScroll = () => {
        const isAtEnd = wrapper.scrollLeft + wrapper.clientWidth >= wrapper.scrollWidth - 5
        wrapper.classList.toggle('scrolled-end', isAtEnd)
      }
      
      wrapper.addEventListener('scroll', handleScroll)
      // Check initial state
      handleScroll()
    })
  }, [html])

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

  // Check if we have any special markers
  const hasSpecialContent = segments.some(s => s.type !== 'html')

  // If no special content, render simple HTML
  if (!hasSpecialContent) {
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
        
        // ROI Calculator segment
        if (segment.type === 'roi-calculator') {
          return (
            <div key={`roi-${index}`} className="my-8">
              <ROICalculator embed />
            </div>
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
