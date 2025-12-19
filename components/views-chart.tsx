'use client'

import { useState, useRef, useCallback } from 'react'
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from 'recharts'

interface ViewsChartProps {
  data: { date: string; views: number; visitors: number; tiago: number; vicente: number }[]
  formatDateShort: (date: string) => string
}

export function ViewsChart({ data, formatDateShort }: ViewsChartProps) {
  const [tooltipData, setTooltipData] = useState<{
    active: boolean
    date: string
    views: number
    tiago: number
    vicente: number
  } | null>(null)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = useCallback((state: any) => {
    // Update active index for cursor line (snaps to data points)
    if (state?.activeTooltipIndex !== undefined) {
      setActiveIndex(state.activeTooltipIndex)
    }

    // Update tooltip data immediately
    if (state?.activePayload?.[0]) {
      const payload = state.activePayload[0].payload
      setTooltipData({
        active: true,
        date: payload.date,
        views: payload.views,
        tiago: payload.tiago,
        vicente: payload.vicente,
      })
    }
  }, [])

  const handleMouseLeave = useCallback(() => {
    setTooltipData(null)
    setActiveIndex(null)
  }, [])

  // Calculate position for cursor line based on data index
  const getCursorPosition = () => {
    if (activeIndex === null || data.length === 0) return null
    const chartWidth = (containerRef.current?.clientWidth || 0) - 68 // subtract pr-[68px]
    const yAxisWidth = 68
    const rightPadding = 10
    const availableWidth = chartWidth - yAxisWidth - rightPadding
    const stepWidth = availableWidth / (data.length - 1)
    return yAxisWidth + (activeIndex * stepWidth)
  }

  if (data.length === 0) {
    return (
      <div className="h-64 w-full flex items-center justify-center">
        <p className="text-muted-foreground text-sm">No views data yet</p>
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
            <linearGradient id="fillViews" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="fillTiago" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#1e40af" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#1e40af" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="fillVicente" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#991b1b" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#991b1b" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis 
          dataKey="date" 
          tickFormatter={(value, index) => index === 0 ? '' : formatDateShort(value)}
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
          axisLine={{ stroke: 'hsl(var(--foreground) / 0.1)' }}
          tickLine={false}
          />
          <YAxis 
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            axisLine={{ stroke: 'hsl(var(--foreground) / 0.1)' }}
            tickLine={false}
          />
          <Area
            type="monotone"
            dataKey="views"
            stroke="hsl(var(--primary))"
            fill="url(#fillViews)"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="tiago"
            stroke="#1e40af"
            fill="url(#fillTiago)"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="vicente"
            stroke="#991b1b"
            fill="url(#fillVicente)"
            strokeWidth={2}
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
                <span className="w-2 h-2 rounded-full" style={{ background: 'hsl(var(--primary))' }}></span>
                <span className="text-foreground">{tooltipData.views.toLocaleString()} total</span>
              </p>
              <p className="text-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ background: '#1e40af' }}></span>
                <span className="text-foreground/80">{tooltipData.tiago.toLocaleString()} Tiago</span>
              </p>
              <p className="text-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ background: '#991b1b' }}></span>
                <span className="text-foreground/80">{tooltipData.vicente.toLocaleString()} Vicente</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
