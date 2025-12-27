'use client'

import { useState, useRef, useCallback } from 'react'
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from 'recharts'

interface AICrawlsChartProps {
  data: { date: string; crawls: number; gptbot: number; claudebot: number; perplexitybot: number; other: number }[]
  formatDateShort: (date: string) => string
}

export function AICrawlsChart({ data, formatDateShort }: AICrawlsChartProps) {
  const [tooltipData, setTooltipData] = useState<{
    active: boolean
    date: string
    crawls: number
    gptbot: number
    claudebot: number
    perplexitybot: number
    other: number
  } | null>(null)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = useCallback((state: any) => {
    if (state?.activeTooltipIndex !== undefined) {
      setActiveIndex(state.activeTooltipIndex)
    }

    if (state?.activePayload?.[0]) {
      const payload = state.activePayload[0].payload
      setTooltipData({
        active: true,
        date: payload.date,
        crawls: payload.crawls,
        gptbot: payload.gptbot,
        claudebot: payload.claudebot,
        perplexitybot: payload.perplexitybot,
        other: payload.other,
      })
    }
  }, [])

  const handleMouseLeave = useCallback(() => {
    setTooltipData(null)
    setActiveIndex(null)
  }, [])

  const getCursorPosition = () => {
    if (activeIndex === null || data.length === 0) return null
    const chartWidth = (containerRef.current?.clientWidth || 0) - 68
    const yAxisWidth = 68
    const rightPadding = 10
    const availableWidth = chartWidth - yAxisWidth - rightPadding
    const stepWidth = availableWidth / (data.length - 1)
    return yAxisWidth + (activeIndex * stepWidth)
  }

  if (data.length === 0) {
    return (
      <div className="h-64 w-full flex items-center justify-center">
        <p className="text-muted-foreground text-sm">No crawl data yet</p>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="h-64 w-full relative overflow-visible pr-[68px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart 
          data={data}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <defs>
            <linearGradient id="fillGPT" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="fillClaude" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="fillPerplexity" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="fillOther" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6b7280" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#6b7280" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="date" 
            tickFormatter={(value, index) => index === 0 ? '' : formatDateShort(value)}
            tick={{ fill: 'var(--chart-text)', fontSize: 12 }}
            axisLine={{ stroke: 'var(--chart-axis)' }}
            tickLine={false}
          />
          <YAxis 
            tick={{ fill: 'var(--chart-text)', fontSize: 12 }}
            axisLine={{ stroke: 'var(--chart-axis)' }}
            tickLine={false}
          />
          <Area
            type="monotone"
            dataKey="gptbot"
            stroke="#10b981"
            fill="url(#fillGPT)"
            strokeWidth={2}
            stackId="1"
          />
          <Area
            type="monotone"
            dataKey="claudebot"
            stroke="#f97316"
            fill="url(#fillClaude)"
            strokeWidth={2}
            stackId="1"
          />
          <Area
            type="monotone"
            dataKey="perplexitybot"
            stroke="#3b82f6"
            fill="url(#fillPerplexity)"
            strokeWidth={2}
            stackId="1"
          />
          <Area
            type="monotone"
            dataKey="other"
            stroke="#6b7280"
            fill="url(#fillOther)"
            strokeWidth={2}
            stackId="1"
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Vertical cursor line */}
      <div
        className={`absolute w-px pointer-events-none transition-opacity duration-150 ${
          activeIndex !== null ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ 
          left: getCursorPosition() ?? 0,
          top: 0,
          bottom: 35,
          backgroundImage: 'linear-gradient(to bottom, hsl(var(--foreground) / 0.2) 50%, transparent 50%)',
          backgroundSize: '1px 8px',
        }}
      />

      {/* Custom tooltip */}
      <div
        className={`absolute pointer-events-none z-10 ${
          activeIndex !== null ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          left: getCursorPosition() ?? 0,
          top: -50,
          transform: 'translateX(-50%)',
        }}
      >
        {tooltipData && (
          <div className="bg-background border border-foreground/10 rounded-lg px-3 py-2 shadow-xl">
            <p className="text-muted-foreground text-xs mb-2">
              {formatDateShort(tooltipData.date)}
            </p>
            <div className="space-y-1">
              <p className="text-sm font-medium flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="text-foreground">{tooltipData.gptbot.toLocaleString()} GPT</span>
              </p>
              <p className="text-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                <span className="text-foreground/80">{tooltipData.claudebot.toLocaleString()} Claude</span>
              </p>
              <p className="text-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <span className="text-foreground/80">{tooltipData.perplexitybot.toLocaleString()} Perplexity</span>
              </p>
              <p className="text-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gray-500"></span>
                <span className="text-foreground/80">{tooltipData.other.toLocaleString()} Other</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
