'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  validateCharts, 
  validateChartMarkers, 
  generateChartErrorPrompt,
  generateChartDocumentation 
} from '@/lib/chart-schemas'

interface AddPostPanelProps {
  isOpen: boolean
  onClose: () => void
  onPostCreated: () => void
}

const EXAMPLE_JSON = `{
  "title": "Your Post Title",
  "content": "Full markdown content...\\n\\n{{chart:0}}\\n\\nMore content after chart...",
  "description": "Short description for previews and SEO",
  "author": "Tiago",
  "tags": ["automation", "n8n", "tutorial"],
  "slug": "custom-url-slug",
  "meta_title": "SEO Title (if different from title)",
  "focus_keyword": "main seo keyword",
  "charts": [
    {
      "type": "bar",
      "title": "Example Chart",
      "data": [
        { "name": "Before", "value": 100 },
        { "name": "After", "value": 20 }
      ],
      "xKey": "name",
      "yKey": "value",
      "color": "#78fcd6"
    }
  ]
}`

const FIELD_HINTS: Record<string, { explanation: string; seoImpact: string; hint: string }> = {
  title: {
    explanation: "The main headline of your blog post",
    seoImpact: "Appears as the clickable title in search results. Should be compelling and include your focus keyword naturally.",
    hint: "Keep it under 60 characters, include your focus keyword near the beginning"
  },
  content: {
    explanation: "The full markdown content of your post",
    seoImpact: "Search engines analyze content for relevance. Use headings (H2, H3), include keywords naturally, and aim for comprehensive coverage of the topic.",
    hint: "Aim for ~800 words (4 min read). Use markdown formatting with H2/H3 headings. Place {{chart:N}} markers where charts should appear."
  },
  description: {
    explanation: "A brief summary of the post content",
    seoImpact: "Used as the meta description in search results. A good description improves click-through rate from search results.",
    hint: "150-160 characters, include focus keyword, make it compelling to click"
  },
  author: {
    explanation: "The post author's name",
    seoImpact: "Builds author authority and trust. Consistent authorship helps with E-E-A-T signals.",
    hint: "Use 'Tiago' or 'Vicente' for author attribution"
  },
  tags: {
    explanation: "Array of relevant topic tags",
    seoImpact: "Helps with content organization and internal linking. Tags can appear in URLs and help search engines understand content categories.",
    hint: "3-5 relevant tags, use lowercase, e.g. [\"automation\", \"workflows\", \"tutorial\"]"
  },
  slug: {
    explanation: "The URL-friendly identifier for the post",
    seoImpact: "Appears in the URL. Clean, keyword-rich slugs improve click-through rate and help search engines understand page content.",
    hint: "Lowercase, hyphens between words, include focus keyword, keep it short (3-5 words)"
  },
  meta_title: {
    explanation: "SEO-optimized title that appears in browser tabs and search results",
    seoImpact: "This is what Google displays as the clickable headline. Can be different from the post title to optimize for search.",
    hint: "Under 60 characters, include focus keyword, add brand name if space allows"
  },
  focus_keyword: {
    explanation: "The primary keyword/phrase you want this post to rank for",
    seoImpact: "Guides your content optimization. Should appear in title, meta_title, description, slug, and naturally throughout content.",
    hint: "2-4 words, research search volume, be specific (long-tail keywords often convert better)"
  },
  charts: {
    explanation: "Array of interactive chart configurations to embed in the post",
    seoImpact: "Charts render as interactive SVG, improving engagement. The data is visible to search engines.",
    hint: "See chart documentation below. Reference charts in content using {{chart:0}}, {{chart:1}}, etc."
  }
}

const REQUIRED_FIELDS = ['title', 'content', 'description', 'author', 'tags', 'slug', 'meta_title', 'focus_keyword']

export function AddPostPanel({ isOpen, onClose, onPostCreated }: AddPostPanelProps) {
  const [jsonInput, setJsonInput] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<{
    valid: boolean
    missingFields: string[]
    chartErrors: string | null
    prompt: string
  } | null>(null)
  const [isPosting, setIsPosting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState<'example' | 'prompt' | null>(null)

  const chartDocumentation = generateChartDocumentation()

  const fullPrompt = `This is an example of the expected blog post input structure. All fields must have values - no empty fields are valid:

${EXAMPLE_JSON}

Field explanations and SEO guidelines:

${Object.entries(FIELD_HINTS).map(([field, info]) => `• ${field}:
  - What it is: ${info.explanation}
  - SEO impact: ${info.seoImpact}
  - Guidelines: ${info.hint}`).join('\n\n')}

${chartDocumentation}

In-content CTAs (automatically tracked when clicked):
When appropriate, include inline calls-to-action within the content to drive engagement. These links are automatically tracked as CTA clicks:
• Free process analysis (no commitment): https://www.nodewave.io/#contact-section
• Schedule a 30-minute consultation: https://cal.com/tiago-lemos-p1wrn8/30min

Example: "Want us to analyze your current workflow? [Get in touch](https://www.nodewave.io/#contact-section) for a free assessment."`

  const copyToClipboard = async (text: string, type: 'example' | 'prompt') => {
    await navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  const analyzeJson = () => {
    setIsAnalyzing(true)
    setError(null)
    setAnalysisResult(null)

    setTimeout(() => {
      try {
        const parsed = JSON.parse(jsonInput)
        const missingFields: string[] = []
        let chartErrorPrompt: string | null = null

        // Check required fields
        for (const field of REQUIRED_FIELDS) {
          const value = parsed[field]
          if (value === undefined || value === null || value === '') {
            missingFields.push(field)
          } else if (Array.isArray(value) && value.length === 0) {
            missingFields.push(field)
          }
        }

        // Validate charts if present
        if (parsed.charts && Array.isArray(parsed.charts) && parsed.charts.length > 0) {
          const chartValidation = validateCharts(parsed.charts)
          const markerErrors = validateChartMarkers(parsed.content || '', parsed.charts)

          if (!chartValidation.valid || markerErrors.length > 0) {
            chartErrorPrompt = generateChartErrorPrompt(chartValidation, markerErrors)
          }
        }

        // Check for chart markers without charts array
        const content = parsed.content || ''
        const hasChartMarkers = /\{\{chart:\d+\}\}/.test(content)
        if (hasChartMarkers && (!parsed.charts || parsed.charts.length === 0)) {
          chartErrorPrompt = 'Content contains chart markers ({{chart:N}}) but no "charts" array is defined. Either add charts or remove the markers.'
        }

        const hasErrors = missingFields.length > 0 || chartErrorPrompt !== null

        if (hasErrors) {
          const promptLines: string[] = []
          
          if (missingFields.length > 0) {
            promptLines.push('The JSON output for this post is incomplete. The following fields are missing or empty:\n')
            for (const field of missingFields) {
              const hint = FIELD_HINTS[field]
              if (hint) {
                promptLines.push(`• ${field}: ${hint.hint}`)
              }
            }
            promptLines.push('')
          }

          if (chartErrorPrompt) {
            promptLines.push(chartErrorPrompt)
          }
          
          promptLines.push('\nPlease fix these issues following the documentation provided.')

          setAnalysisResult({
            valid: false,
            missingFields,
            chartErrors: chartErrorPrompt,
            prompt: promptLines.join('\n')
          })
        } else {
          setAnalysisResult({
            valid: true,
            missingFields: [],
            chartErrors: null,
            prompt: ''
          })
        }
      } catch (e) {
        setError('Invalid JSON format. Please check your input.')
      }

      setIsAnalyzing(false)
    }, 800)
  }

  const handlePost = async () => {
    setIsPosting(true)
    setError(null)

    try {
      const parsed = JSON.parse(jsonInput)
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.access_token) {
        throw new Error('Not authenticated')
      }

      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(parsed),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create post')
      }

      onPostCreated()
      onClose()
      setJsonInput('')
      setAnalysisResult(null)
    } catch (e: any) {
      setError(e.message || 'Failed to create post')
    }

    setIsPosting(false)
  }

  const handleClose = () => {
    onClose()
    setJsonInput('')
    setAnalysisResult(null)
    setError(null)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      <div className="relative w-full max-w-2xl mx-4 bg-gradient-to-b from-foreground/[0.06] to-foreground/[0.03] border border-foreground/[0.08] rounded-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-foreground/[0.06]">
          <h2 className="text-foreground text-xl font-semibold">Add New Post</h2>
          <button
            onClick={handleClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Example Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-foreground font-medium">Expected Format & Guidelines</h3>
              <button
                onClick={() => copyToClipboard(fullPrompt, 'example')}
                className="text-sm text-primary flex items-center gap-1"
              >
                {copied === 'example' ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span>Copy for Claude</span>
                  </>
                )}
              </button>
            </div>
            <div className="bg-foreground/[0.03] border border-foreground/[0.06] rounded-lg p-4 max-h-48 overflow-y-auto">
              <pre className="text-muted-foreground text-sm whitespace-pre-wrap font-mono">{fullPrompt}</pre>
            </div>
          </div>

          {/* JSON Input */}
          <div>
            <h3 className="text-foreground font-medium mb-2">Paste Post JSON</h3>
            <textarea
              value={jsonInput}
              onChange={(e) => {
                setJsonInput(e.target.value)
                setAnalysisResult(null)
                setError(null)
              }}
              placeholder="Paste your post JSON here..."
              className="w-full h-48 bg-foreground/[0.03] border border-foreground/[0.06] rounded-lg p-4 text-foreground text-sm font-mono placeholder:text-muted-foreground/50 resize-none focus:outline-none focus:border-primary/50"
            />
          </div>

          {/* Analyze Button */}
          {jsonInput && !analysisResult && (
            <button
              onClick={analyzeJson}
              disabled={isAnalyzing}
              className="w-full py-3 bg-foreground/10 hover:bg-foreground/15 text-foreground rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Analyzing...
                </>
              ) : (
                'Analyze JSON'
              )}
            </button>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Analysis Result - Missing Fields or Chart Errors */}
          {analysisResult && !analysisResult.valid && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-foreground font-medium flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-yellow-500" />
                  {analysisResult.missingFields.length > 0 && analysisResult.chartErrors 
                    ? 'Missing Fields & Chart Errors'
                    : analysisResult.missingFields.length > 0 
                      ? 'Missing Fields' 
                      : 'Chart Errors'}
                </h3>
                <button
                  onClick={() => copyToClipboard(analysisResult.prompt, 'prompt')}
                  className="text-sm text-primary flex items-center gap-1"
                >
                  {copied === 'prompt' ? (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <span>Copy Prompt</span>
                    </>
                  )}
                </button>
              </div>
              <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-4">
                <pre className="text-muted-foreground text-sm whitespace-pre-wrap">{analysisResult.prompt}</pre>
              </div>
            </div>
          )}

          {/* Analysis Result - Valid */}
          {analysisResult && analysisResult.valid && (
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-primary" />
              <p className="text-foreground">All fields are complete. Ready to post!</p>
            </div>
          )}
        </div>

        {/* Footer */}
        {analysisResult?.valid && (
          <div className="p-6 border-t border-foreground/[0.06]">
            <button
              onClick={handlePost}
              disabled={isPosting}
              className="w-full py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isPosting ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating...
                </>
              ) : (
                'Post as Draft'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
