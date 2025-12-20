// Chart type definitions and validation for blog posts

export type ChartType = 
  | 'line' 
  | 'area' 
  | 'bar' 
  | 'pie' 
  | 'radar' 
  | 'scatter' 
  | 'treemap' 
  | 'funnel'

export interface BaseChart {
  type: ChartType
  title?: string
  color?: string
  colors?: string[]
  height?: number
}

export interface XYChart extends BaseChart {
  type: 'line' | 'area' | 'bar' | 'scatter'
  data: Record<string, unknown>[]
  xKey: string
  yKey: string
  yKeys?: string[] // For multiple lines/bars
}

export interface PieChartConfig extends BaseChart {
  type: 'pie'
  data: Record<string, unknown>[]
  nameKey: string
  valueKey: string
  innerRadius?: number // For donut style
}

export interface RadarChartConfig extends BaseChart {
  type: 'radar'
  data: Record<string, unknown>[]
  angleKey: string
  dataKeys: string[]
}

export interface TreemapChartConfig extends BaseChart {
  type: 'treemap'
  data: Record<string, unknown>[]
  dataKey: string
  nameKey: string
}

export interface FunnelChartConfig extends BaseChart {
  type: 'funnel'
  data: Record<string, unknown>[]
  dataKey: string
  nameKey: string
}

export type ChartConfig = 
  | XYChart 
  | PieChartConfig 
  | RadarChartConfig 
  | TreemapChartConfig 
  | FunnelChartConfig

// Schema definitions for validation
interface ChartSchema {
  required: string[]
  dataKeys: string[]
  description: string
  example: ChartConfig
}

export const CHART_SCHEMAS: Record<ChartType, ChartSchema> = {
  line: {
    required: ['data', 'xKey', 'yKey'],
    dataKeys: ['xKey', 'yKey'],
    description: 'Line chart for showing trends over time or continuous data',
    example: {
      type: 'line',
      title: 'Monthly Revenue',
      data: [
        { month: 'Jan', revenue: 4000 },
        { month: 'Feb', revenue: 3000 },
        { month: 'Mar', revenue: 5000 }
      ],
      xKey: 'month',
      yKey: 'revenue',
      color: '#78fcd6'
    }
  },
  area: {
    required: ['data', 'xKey', 'yKey'],
    dataKeys: ['xKey', 'yKey'],
    description: 'Area chart - like line but filled, good for showing volume',
    example: {
      type: 'area',
      title: 'Website Traffic',
      data: [
        { week: 'W1', visitors: 1200 },
        { week: 'W2', visitors: 1800 },
        { week: 'W3', visitors: 1400 }
      ],
      xKey: 'week',
      yKey: 'visitors',
      color: '#78fcd6'
    }
  },
  bar: {
    required: ['data', 'xKey', 'yKey'],
    dataKeys: ['xKey', 'yKey'],
    description: 'Bar chart for comparing discrete categories',
    example: {
      type: 'bar',
      title: 'Processing Time by Method',
      data: [
        { method: 'Manual', hours: 45 },
        { method: 'Semi-Auto', hours: 20 },
        { method: 'Full Auto', hours: 5 }
      ],
      xKey: 'method',
      yKey: 'hours',
      color: '#78fcd6'
    }
  },
  pie: {
    required: ['data', 'nameKey', 'valueKey'],
    dataKeys: ['nameKey', 'valueKey'],
    description: 'Pie chart for showing proportions of a whole',
    example: {
      type: 'pie',
      title: 'Time Spent by Task',
      data: [
        { task: 'Data Entry', hours: 20 },
        { task: 'Review', hours: 10 },
        { task: 'Approval', hours: 5 }
      ],
      nameKey: 'task',
      valueKey: 'hours'
    }
  },
  radar: {
    required: ['data', 'angleKey', 'dataKeys'],
    dataKeys: ['angleKey'],
    description: 'Radar/spider chart for comparing multiple variables. When two series are provided, the smaller shape cuts out from the larger one showing only the difference.',
    example: {
      type: 'radar',
      title: 'Solution Comparison',
      data: [
        { metric: 'Speed', optionA: 80, optionB: 65 },
        { metric: 'Cost', optionA: 70, optionB: 85 },
        { metric: 'Quality', optionA: 90, optionB: 75 }
      ],
      angleKey: 'metric',
      dataKeys: ['optionA', 'optionB']
    }
  },
  scatter: {
    required: ['data', 'xKey', 'yKey'],
    dataKeys: ['xKey', 'yKey'],
    description: 'Scatter plot for showing correlation between two variables',
    example: {
      type: 'scatter',
      title: 'Effort vs Impact',
      data: [
        { effort: 2, impact: 8 },
        { effort: 5, impact: 6 },
        { effort: 8, impact: 9 }
      ],
      xKey: 'effort',
      yKey: 'impact',
      color: '#78fcd6'
    }
  },
  treemap: {
    required: ['data', 'dataKey', 'nameKey'],
    dataKeys: ['dataKey', 'nameKey'],
    description: 'Treemap for showing hierarchical data as nested rectangles. Larger values are lighter, smaller values are darker.',
    example: {
      type: 'treemap',
      title: 'Budget Allocation',
      data: [
        { name: 'Marketing', value: 25000 },
        { name: 'Engineering', value: 45000 },
        { name: 'Sales', value: 30000 },
        { name: 'Support', value: 15000 }
      ],
      dataKey: 'value',
      nameKey: 'name'
    }
  },
  funnel: {
    required: ['data', 'dataKey', 'nameKey'],
    dataKeys: ['dataKey', 'nameKey'],
    description: 'Funnel chart displayed as an equilateral triangle for showing conversion stages. Larger values are lighter, smaller values are darker.',
    example: {
      type: 'funnel',
      title: 'Sales Funnel',
      data: [
        { stage: 'Leads', count: 1000 },
        { stage: 'Qualified', count: 600 },
        { stage: 'Proposals', count: 300 },
        { stage: 'Closed', count: 100 }
      ],
      dataKey: 'count',
      nameKey: 'stage'
    }
  }
}

export interface ChartValidationError {
  chartIndex: number
  chartType: string
  errors: string[]
}

export interface ChartValidationResult {
  valid: boolean
  errors: ChartValidationError[]
}

/**
 * Validates an array of chart configurations
 */
export function validateCharts(charts: unknown[]): ChartValidationResult {
  const errors: ChartValidationError[] = []

  if (!Array.isArray(charts)) {
    return {
      valid: false,
      errors: [{ chartIndex: -1, chartType: 'unknown', errors: ['Charts must be an array'] }]
    }
  }

  charts.forEach((chart, index) => {
    const chartErrors: string[] = []

    // Check if chart is an object
    if (!chart || typeof chart !== 'object') {
      errors.push({
        chartIndex: index,
        chartType: 'unknown',
        errors: ['Chart must be an object']
      })
      return
    }

    const chartObj = chart as Record<string, unknown>

    // Check type field
    if (!chartObj.type || typeof chartObj.type !== 'string') {
      chartErrors.push('Missing or invalid "type" field')
      errors.push({ chartIndex: index, chartType: 'unknown', errors: chartErrors })
      return
    }

    const chartType = chartObj.type as string
    const schema = CHART_SCHEMAS[chartType as ChartType]

    if (!schema) {
      const validTypes = Object.keys(CHART_SCHEMAS).join(', ')
      chartErrors.push(`Invalid chart type "${chartType}". Valid types: ${validTypes}`)
      errors.push({ chartIndex: index, chartType, errors: chartErrors })
      return
    }

    // Check required fields
    for (const field of schema.required) {
      if (chartObj[field] === undefined || chartObj[field] === null) {
        chartErrors.push(`Missing required field: "${field}"`)
      }
    }

    // Check data array
    if (!Array.isArray(chartObj.data)) {
      chartErrors.push('"data" must be an array')
    } else if (chartObj.data.length === 0) {
      chartErrors.push('"data" array cannot be empty')
    } else {
      // Check that dataKeys exist in data objects
      const firstDataItem = chartObj.data[0] as Record<string, unknown>
      const availableKeys = Object.keys(firstDataItem)

      for (const keyField of schema.dataKeys) {
        const keyValue = chartObj[keyField]
        
        if (typeof keyValue === 'string') {
          if (!availableKeys.includes(keyValue)) {
            chartErrors.push(
              `Data key "${keyValue}" (from "${keyField}") not found in data objects. Available keys: ${availableKeys.join(', ')}`
            )
          }
        } else if (Array.isArray(keyValue)) {
          // For fields like dataKeys in radar charts
          for (const k of keyValue) {
            if (typeof k === 'string' && !availableKeys.includes(k)) {
              chartErrors.push(
                `Data key "${k}" (from "${keyField}") not found in data objects. Available keys: ${availableKeys.join(', ')}`
              )
            }
          }
        }
      }
    }

    if (chartErrors.length > 0) {
      errors.push({ chartIndex: index, chartType, errors: chartErrors })
    }
  })

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Validates that chart markers in content match the charts array
 */
export function validateChartMarkers(content: string, charts: unknown[]): string[] {
  const errors: string[] = []
  const markerRegex = /\{\{chart:(\d+)\}\}/g
  const matches = content.matchAll(markerRegex)
  const usedIndices = new Set<number>()

  for (const match of matches) {
    const index = parseInt(match[1], 10)
    usedIndices.add(index)

    if (index >= charts.length) {
      errors.push(
        `Content references {{chart:${index}}} but only ${charts.length} chart(s) defined (indices 0-${charts.length - 1})`
      )
    }
  }

  // Check for unused charts
  charts.forEach((_, index) => {
    if (!usedIndices.has(index)) {
      errors.push(
        `Chart at index ${index} is defined but not used in content. Add {{chart:${index}}} where you want it to appear.`
      )
    }
  })

  return errors
}

/**
 * Generate a prompt explaining chart errors for Claude
 */
export function generateChartErrorPrompt(result: ChartValidationResult, markerErrors: string[]): string {
  const lines: string[] = ['The charts in your JSON have validation errors:\n']

  for (const error of result.errors) {
    lines.push(`Chart ${error.chartIndex} (${error.chartType}):`)
    for (const e of error.errors) {
      lines.push(`  ✗ ${e}`)
    }
    lines.push('')
  }

  if (markerErrors.length > 0) {
    lines.push('Content marker errors:')
    for (const e of markerErrors) {
      lines.push(`  ✗ ${e}`)
    }
    lines.push('')
  }

  lines.push('Please fix these issues. Reference the chart schema documentation for correct structure.')

  return lines.join('\n')
}

/**
 * Generate documentation for all chart types (for the Claude prompt)
 */
export function generateChartDocumentation(): string {
  const lines: string[] = [
    'CHARTS:',
    'You can include interactive charts in blog posts. Add a "charts" array to the JSON and use {{chart:N}} markers in content.',
    '',
    'Chart Types & Required Fields:',
    ''
  ]

  for (const [type, schema] of Object.entries(CHART_SCHEMAS)) {
    lines.push(`• ${type}: ${schema.description}`)
    lines.push(`  Required: ${schema.required.join(', ')}`)
    lines.push(`  Example:`)
    lines.push(`  ${JSON.stringify(schema.example, null, 2).split('\n').map((l, i) => i === 0 ? l : '  ' + l).join('\n')}`)
    lines.push('')
  }

  lines.push('Usage in content:')
  lines.push('Place {{chart:0}} where you want the first chart, {{chart:1}} for second, etc.')
  lines.push('')
  lines.push('Optional fields for all charts:')
  lines.push('  - title: Chart title displayed above')
  lines.push('  - color: Primary color (hex, e.g., "#78fcd6")')
  lines.push('  - colors: Array of colors for multiple series')
  lines.push('  - height: Chart height in pixels (default: 300)')

  return lines.join('\n')
}
