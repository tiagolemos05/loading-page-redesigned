'use client'

import { useMemo } from 'react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ScatterChart,
  Scatter,
  Treemap,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import type { ChartConfig } from '@/lib/chart-schemas'

// Brand colors - use CSS variables for theme support
const BRAND_GREEN = 'var(--chart-primary)'
const BRAND_GREY = 'var(--chart-secondary)'

interface BlogChartProps {
  config: ChartConfig
}

// Custom tooltip style matching the dark theme
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null

  return (
    <div className="bg-background/95 border border-foreground/10 rounded-lg px-3 py-2 shadow-lg backdrop-blur-sm">
      {label && <p className="text-foreground text-sm font-medium mb-1">{label}</p>}
      {payload.map((entry: any, index: number) => (
        <p key={index} className="text-muted-foreground text-sm">
          <span style={{ color: entry.color || BRAND_GREEN }}>{entry.name || entry.dataKey}</span>: {entry.value}
        </p>
      ))}
    </div>
  )
}

// Axis styling - use CSS variables
const axisStyle = {
  fontSize: 12,
  fill: 'var(--chart-text)',
}

// Generate primary color shades by using HSL manipulation via CSS
// For dark mode: teal shades, for light mode: blue shades
const getGreenShade = (index: number, total: number) => {
  // We'll use opacity-based shading that works with the CSS variable
  const maxOpacity = 1
  const minOpacity = 0.3
  const opacity = maxOpacity - (index / Math.max(total - 1, 1)) * (maxOpacity - minOpacity)
  return `rgba(var(--chart-primary-rgb), ${opacity})`
}

// Hidden SVG with gradient definitions
const GradientDefs = ({ id, cellCount = 6 }: { id: string, cellCount?: number }) => {
  // Use actual cellCount for treemap/funnel gradients
  const actualCellCount = Math.max(cellCount, 1)
  
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }}>
      <defs>
                {/* Green edge glow - left side */}
        <linearGradient id={`${id}-edge-left-green`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="var(--chart-primary)" stopOpacity={0.5} />
          <stop offset="100%" stopColor="var(--chart-primary)" stopOpacity={0} />
        </linearGradient>
        
        {/* Green edge glow - right side */}
        <linearGradient id={`${id}-edge-right-green`} x1="100%" y1="0%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="var(--chart-primary)" stopOpacity={0.5} />
          <stop offset="100%" stopColor="var(--chart-primary)" stopOpacity={0} />
        </linearGradient>
        
        {/* Green edge glow - bottom */}
        <linearGradient id={`${id}-edge-bottom-green`} x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="var(--chart-primary)" stopOpacity={0.5} />
          <stop offset="100%" stopColor="var(--chart-primary)" stopOpacity={0} />
        </linearGradient>
        
        {/* Grey edge glow - left side */}
        <linearGradient id={`${id}-edge-left-grey`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="var(--chart-secondary)" stopOpacity={0.5} />
          <stop offset="100%" stopColor="var(--chart-secondary)" stopOpacity={0} />
        </linearGradient>
        
        {/* Grey edge glow - right side */}
        <linearGradient id={`${id}-edge-right-grey`} x1="100%" y1="0%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="var(--chart-secondary)" stopOpacity={0.5} />
          <stop offset="100%" stopColor="var(--chart-secondary)" stopOpacity={0} />
        </linearGradient>
        
        {/* Grey edge glow - bottom */}
        <linearGradient id={`${id}-edge-bottom-grey`} x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="var(--chart-secondary)" stopOpacity={0.5} />
          <stop offset="100%" stopColor="var(--chart-secondary)" stopOpacity={0} />
        </linearGradient>
        
        {/* Area/Line fill gradient */}
        <linearGradient id={`${id}-area`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="var(--chart-primary)" stopOpacity={0.4} />
          <stop offset="50%" stopColor="var(--chart-primary)" stopOpacity={0.15} />
          <stop offset="100%" stopColor="var(--chart-primary)" stopOpacity={0.05} />
        </linearGradient>
        
                {/* Treemap cell colors - opacity based */}
        {Array.from({ length: actualCellCount }).map((_, i) => {
          const maxOpacity = 1
          const minOpacity = 0.3
          const opacity = maxOpacity - (i / Math.max(actualCellCount - 1, 1)) * (maxOpacity - minOpacity)
          return (
            <linearGradient key={`cell-${i}`} id={`${id}-cell-${i}`} x1="0%" y1="0%" x2="0%" y2="0%">
              <stop offset="0%" stopColor={`rgba(var(--chart-primary-rgb), ${opacity})`} />
              <stop offset="100%" stopColor={`rgba(var(--chart-primary-rgb), ${opacity})`} />
            </linearGradient>
          )
        })}
        
        {/* Funnel section colors - opacity based */}
        {Array.from({ length: actualCellCount }).map((_, i) => {
          const maxOpacity = 1
          const minOpacity = 0.3
          const opacity = maxOpacity - (i / Math.max(actualCellCount - 1, 1)) * (maxOpacity - minOpacity)
          return (
            <linearGradient key={`funnel-${i}`} id={`${id}-funnel-${i}`} x1="0%" y1="0%" x2="0%" y2="0%">
              <stop offset="0%" stopColor={`rgba(var(--chart-primary-rgb), ${opacity})`} />
              <stop offset="100%" stopColor={`rgba(var(--chart-primary-rgb), ${opacity})`} />
            </linearGradient>
          )
        })}
      </defs>
    </svg>
  )
}

// Bar shape with fill + side edge glows only (no bottom gradient)
const createEdgeBar = (gradientId: string, colorKey: 'green' | 'grey') => (props: any) => {
  const { x, y, width, height } = props
  if (!height || height <= 0 || !width || width <= 0) return null
  
  const radius = 6
  const safeRadius = Math.min(radius, width / 2, height)
  const color = colorKey === 'green' ? 'var(--chart-primary)' : 'var(--chart-secondary)'
  const colorRgb = colorKey === 'green' ? 'var(--chart-primary-rgb)' : 'var(--chart-secondary-rgb)'
  const edgeWidth = width * 0.15
  
  // Full bar path with rounded top
  const barPath = `
    M ${x},${y + safeRadius}
    Q ${x},${y} ${x + safeRadius},${y}
    L ${x + width - safeRadius},${y}
    Q ${x + width},${y} ${x + width},${y + safeRadius}
    L ${x + width},${y + height}
    L ${x},${y + height}
    Z
  `
  
  // Border path (no bottom line)
  const borderPath = `
    M ${x},${y + height}
    L ${x},${y + safeRadius}
    Q ${x},${y} ${x + safeRadius},${y}
    L ${x + width - safeRadius},${y}
    Q ${x + width},${y} ${x + width},${y + safeRadius}
    L ${x + width},${y + height}
  `
  
  return (
    <g>
      {/* Solid background fill */}
      <path d={barPath} fill={color} fillOpacity={0.25} />
      
      {/* Left edge glow */}
      <rect
        x={x}
        y={y + safeRadius}
        width={edgeWidth}
        height={height - safeRadius}
        fill={`url(#${gradientId}-edge-left-${colorKey})`}
      />
      
      {/* Right edge glow */}
      <rect
        x={x + width - edgeWidth}
        y={y + safeRadius}
        width={edgeWidth}
        height={height - safeRadius}
        fill={`url(#${gradientId}-edge-right-${colorKey})`}
      />
      
      {/* Top rounded corners with glow */}
      <path
        d={`
          M ${x},${y + safeRadius}
          Q ${x},${y} ${x + safeRadius},${y}
          L ${x + edgeWidth},${y}
          L ${x + edgeWidth},${y + safeRadius}
          Z
        `}
        fill={`url(#${gradientId}-edge-left-${colorKey})`}
      />
      <path
        d={`
          M ${x + width},${y + safeRadius}
          Q ${x + width},${y} ${x + width - safeRadius},${y}
          L ${x + width - edgeWidth},${y}
          L ${x + width - edgeWidth},${y + safeRadius}
          Z
        `}
        fill={`url(#${gradientId}-edge-right-${colorKey})`}
      />
      
            {/* Border line */}
      <path 
        d={borderPath}
        fill="none"
        stroke={color}
        strokeOpacity={0.4}
        strokeWidth={1.5}
      />
    </g>
  )
}

// Custom pie label positioned outside without line
const RADIAN = Math.PI / 180
const renderPieLabel = ({ cx, cy, midAngle, outerRadius, name, percent }: any) => {
  const radius = outerRadius * 1.25
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)

  return (
    <text
      x={x}
      y={y}
      fill="var(--chart-text)"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      fontSize={11}
    >
      {`${name} ${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

// Custom legend for bar charts with multiple series
const CustomBarLegend = ({ payload }: any) => (
  <div className="flex justify-center gap-6 mt-2">
    {payload?.map((entry: any, index: number) => (
      <div key={index} className="flex items-center gap-2">
        <div 
          className="w-3 h-3 rounded-sm"
          style={{ backgroundColor: index === 0 ? BRAND_GREEN : BRAND_GREY }}
        />
        <span className="text-xs text-muted-foreground">{entry.value}</span>
      </div>
    ))}
  </div>
)

// Custom legend for radar (reversed colors - first grey, second green)
const CustomRadarLegend = ({ payload }: any) => (
  <div className="flex justify-center gap-6 mt-2">
    {payload?.map((entry: any, index: number) => (
      <div key={index} className="flex items-center gap-2">
        <div 
          className="w-3 h-3 rounded-sm"
          style={{ backgroundColor: index === 0 ? BRAND_GREY : BRAND_GREEN }}
        />
        <span className="text-xs text-muted-foreground">{entry.value}</span>
      </div>
    ))}
  </div>
)

// Custom equilateral triangle funnel with equal height sections
const EquilateralTriangleFunnel = ({ data, gradientId, nameKey }: any) => {
  if (!data || data.length === 0) return null
  
  const width = 500
  const height = 320
  const padding = 50
  const cornerRadius = 8
  
  const availableWidth = width - padding * 2
  const availableHeight = height - padding * 2
  
  const equilateralHeight = availableWidth * (Math.sqrt(3) / 2)
  
  let triangleBase: number
  let triangleHeight: number
  
  if (equilateralHeight <= availableHeight) {
    triangleBase = availableWidth
    triangleHeight = equilateralHeight
  } else {
    triangleHeight = availableHeight
    triangleBase = triangleHeight / (Math.sqrt(3) / 2)
  }
  
  const centerX = width / 2
  const topY = padding
  const bottomY = topY + triangleHeight
  const leftX = centerX - triangleBase / 2
  const rightX = centerX + triangleBase / 2
  
  const trianglePath = `
    M ${leftX + cornerRadius},${topY}
    L ${rightX - cornerRadius},${topY}
    Q ${rightX},${topY} ${rightX - cornerRadius * 0.5},${topY + cornerRadius}
    L ${centerX + cornerRadius * 0.5},${bottomY - cornerRadius}
    Q ${centerX},${bottomY} ${centerX - cornerRadius * 0.5},${bottomY - cornerRadius}
    L ${leftX + cornerRadius * 0.5},${topY + cornerRadius}
    Q ${leftX},${topY} ${leftX + cornerRadius},${topY}
    Z
  `
  
  const sectionCount = data.length
  const sectionHeight = triangleHeight / sectionCount
  
  const sections = data.map((d: any, i: number) => ({
    ...d,
    y: topY + i * sectionHeight,
    height: sectionHeight,
    index: i,
  }))
  
  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
      <defs>
        <clipPath id={`${gradientId}-triangle-clip`}>
          <path d={trianglePath} />
        </clipPath>
      </defs>
      
      <g clipPath={`url(#${gradientId}-triangle-clip)`}>
        {sections.map((section: any, i: number) => (
          <rect
            key={i}
            x={0}
            y={section.y}
            width={width}
            height={section.height + 1}
            fill={`url(#${gradientId}-funnel-${i})`}
          />
        ))}
        
        {sections.slice(1).map((section: any, i: number) => (
          <line
            key={`line-${i}`}
            x1={0}
            y1={section.y}
            x2={width}
            y2={section.y}
            stroke="rgba(255,255,255,0.25)"
            strokeWidth={1}
          />
        ))}
      </g>
      
      <path
        d={trianglePath}
        fill="none"
        stroke="rgba(255,255,255,0.4)"
        strokeWidth={1.5}
      />
      
            {sections.map((section: any, i: number) => {
        const labelY = section.y + section.height / 2
        const labelX = rightX + 20
        return (
          <text
            key={`label-${i}`}
            x={labelX}
            y={labelY}
            fill="var(--chart-text)"
            fontSize={12}
            dominantBaseline="middle"
          >
            {section[nameKey]}
          </text>
        )
      })}
    </svg>
  )
}

export function BlogChart({ config }: BlogChartProps) {
  const gradientId = useMemo(() => `chart-${Math.random().toString(36).substr(2, 9)}`, [])
  const height = config.height || 300
  
  // Create bar shapes for both colors
  const GreenBar = useMemo(() => createEdgeBar(gradientId, 'green'), [gradientId])
  const GreyBar = useMemo(() => createEdgeBar(gradientId, 'grey'), [gradientId])
  
  // Sort pie data by value (largest first)
  const sortedPieData = useMemo(() => {
    if (config.type !== 'pie') return null
    return [...config.data].sort((a, b) => b[config.valueKey] - a[config.valueKey])
  }, [config])
  
  // Sort funnel data by value (largest first)
  const sortedFunnelData = useMemo(() => {
    if (config.type !== 'funnel') return null
    return [...config.data].sort((a, b) => b[config.dataKey] - a[config.dataKey])
  }, [config])

  const renderChart = () => {
    switch (config.type) {
      case 'line':
        return (
          <LineChart data={config.data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
            <XAxis dataKey={config.xKey} tick={axisStyle} axisLine={false} tickLine={false} />
            <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            {config.yKeys ? (
              config.yKeys.map((key, i) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={i === 0 ? BRAND_GREEN : BRAND_GREY}
                  strokeWidth={2}
                  dot={{ fill: i === 0 ? BRAND_GREEN : BRAND_GREY, strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6, fill: i === 0 ? BRAND_GREEN : BRAND_GREY }}
                />
              ))
            ) : (
              <Line
                type="monotone"
                dataKey={config.yKey}
                stroke={BRAND_GREEN}
                strokeWidth={2}
                dot={{ fill: BRAND_GREEN, strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6, fill: BRAND_GREEN }}
              />
            )}
            {config.yKeys && config.yKeys.length > 1 && <Legend content={<CustomBarLegend />} />}
          </LineChart>
        )

      case 'area':
        return (
          <AreaChart data={config.data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
            <XAxis dataKey={config.xKey} tick={axisStyle} axisLine={false} tickLine={false} />
            <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            {config.yKeys ? (
              config.yKeys.map((key) => (
                <Area
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={BRAND_GREEN}
                  fill={`url(#${gradientId}-area)`}
                  strokeWidth={2}
                />
              ))
            ) : (
              <Area
                type="monotone"
                dataKey={config.yKey}
                stroke={BRAND_GREEN}
                fill={`url(#${gradientId}-area)`}
                strokeWidth={2}
              />
            )}
            {config.yKeys && config.yKeys.length > 1 && <Legend />}
          </AreaChart>
        )

      case 'bar':
        const hasMultipleBars = config.yKeys && config.yKeys.length > 1
        return (
          <BarChart data={config.data} barSize={45}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
            <XAxis dataKey={config.xKey} tick={axisStyle} axisLine={false} tickLine={false} />
            <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--chart-grid)' }} />
            {config.yKeys ? (
              config.yKeys.map((key, i) => (
                <Bar 
                  key={key} 
                  dataKey={key}
                  shape={i === 0 ? GreenBar : GreyBar}
                  legendType="square"
                />
              ))
            ) : (
              <Bar 
                dataKey={config.yKey}
                shape={GreenBar}
              />
            )}
            {hasMultipleBars && <Legend content={<CustomBarLegend />} />}
          </BarChart>
        )

      case 'pie':
        const pieCount = sortedPieData?.length || 1
        return (
          <PieChart>
            <Pie
              data={sortedPieData}
              dataKey={config.valueKey}
              nameKey={config.nameKey}
              cx="50%"
              cy="50%"
              innerRadius={config.innerRadius || 0}
              outerRadius="65%"
              paddingAngle={0}
              stroke="rgba(255,255,255,0.4)"
              strokeWidth={1.5}
              label={renderPieLabel}
              labelLine={false}
            >
              {sortedPieData?.map((_, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={getGreenShade(index, pieCount)}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        )

      case 'radar':
        const radarDataKeys = config.dataKeys || []
        
        return (
          <RadarChart data={config.data} cx="50%" cy="50%" outerRadius="70%">
            <PolarGrid stroke="var(--chart-grid)" />
            <PolarAngleAxis dataKey={config.angleKey} tick={axisStyle} />
            <PolarRadiusAxis tick={axisStyle} axisLine={false} />
            {radarDataKeys.map((key, i) => (
              <Radar
                key={key}
                name={key}
                dataKey={key}
                stroke={i === 0 ? BRAND_GREY : BRAND_GREEN}
                fill={i === 0 ? BRAND_GREY : BRAND_GREEN}
                fillOpacity={0.25}
                strokeWidth={2}
              />
            ))}
            <Tooltip content={<CustomTooltip />} />
            {radarDataKeys.length > 1 && <Legend content={<CustomRadarLegend />} />}
          </RadarChart>
        )

      case 'scatter':
        return (
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
            <XAxis dataKey={config.xKey} tick={axisStyle} axisLine={false} tickLine={false} name={config.xKey} />
            <YAxis dataKey={config.yKey} tick={axisStyle} axisLine={false} tickLine={false} name={config.yKey} />
            <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
            <Scatter data={config.data} fill={BRAND_GREEN}>
              {config.data.map((_, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={BRAND_GREEN}
                  fillOpacity={0.7}
                />
              ))}
            </Scatter>
          </ScatterChart>
        )

      case 'treemap':
        // Sort data by value (largest first) to determine opacity
        const sortedTreemapData = [...config.data].sort((a, b) => b[config.dataKey] - a[config.dataKey])
        // Create lookup by name+value to handle duplicates
        const itemToIndex = new Map(
          sortedTreemapData.map((item, idx) => [
            `${item[config.nameKey || 'name']}-${item[config.dataKey]}`,
            idx
          ])
        )
        const totalItems = config.data.length
        // Calculate total to filter out root node
        const totalSum = config.data.reduce((sum: number, item: any) => sum + item[config.dataKey], 0)
        
        return (
          <Treemap
            data={config.data}
            dataKey={config.dataKey}
            aspectRatio={4 / 3}
            stroke="rgba(255,255,255,0.35)"
            strokeWidth={1.5}
            isAnimationActive={false}
            content={({ x, y, width, height, name, value }: any) => {
              // Skip invalid dimensions or root node (value equals total sum)
              if (!width || !height || value === totalSum) return null
              // Use name+value combo to get sorted index
              const sortedIndex = itemToIndex.get(`${name}-${value}`) ?? 0
              // Use same darkening function as pie chart
              const fillColor = getGreenShade(sortedIndex, totalItems)
              
              return (
                <g>
                  <rect
                    x={x}
                    y={y}
                    width={width}
                    height={height}
                    fill={fillColor}
                    fillOpacity={0.5}
                    stroke="rgba(255,255,255,0.35)"
                    strokeWidth={1.5}
                    rx={4}
                  />
                  {width > 50 && height > 30 && (
                    <>
                      <text
                        x={x + width / 2}
                        y={y + height / 2 - 8}
                        textAnchor="middle"
                        fill="white"
                        fontSize={12}
                        fontWeight={500}
                      >
                        {name}
                      </text>
                      <text
                        x={x + width / 2}
                        y={y + height / 2 + 10}
                        textAnchor="middle"
                        fill="white"
                        fontSize={11}
                      >
                        {value}
                      </text>
                    </>
                  )}
                </g>
              )
            }}
          />
        )

      case 'funnel':
        return (
          <EquilateralTriangleFunnel 
            data={sortedFunnelData}
            gradientId={gradientId}
            dataKey={config.dataKey}
            nameKey={config.nameKey}
          />
        )

      case 'radialBar':
      case 'composed':
        return (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            This chart type has been deprecated
          </div>
        )

      default:
        return (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Unknown chart type
          </div>
        )
    }
  }

  const cellCount = config.type === 'treemap' || config.type === 'funnel' ? config.data.length : 6

  return (
    <div className="my-8">
      {config.title && (
        <h4 className="text-foreground text-lg font-medium mb-4 text-center">{config.title}</h4>
      )}
      <GradientDefs id={gradientId} cellCount={cellCount} />
      <div 
        className="bg-foreground/[0.02] border border-foreground/[0.06] rounded-xl p-4"
        style={{ height }}
      >
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  )
}
