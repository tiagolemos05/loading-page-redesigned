'use client'

import { useEffect } from 'react'

interface ArticleData {
  slug: string
  title: string
  views: number
  clicks: number
  author: string
}

interface ArticlesModalProps {
  isOpen: boolean
  articles: ArticleData[]
  onClose: () => void
}

export function ArticlesModal({ isOpen, articles, onClose }: ArticlesModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const maxViews = articles[0]?.views || 1

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-lg mx-4 bg-gradient-to-b from-foreground/[0.06] to-foreground/[0.03] border border-foreground/[0.08] rounded-2xl p-6 max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-foreground text-xl font-semibold">
            All Articles
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="overflow-y-auto flex-1">
          {articles.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No article views yet</p>
          ) : (
            <div className="space-y-3">
              {articles.map((article, index) => {
                const percentage = (article.views / maxViews) * 100
                const ctr = article.views > 0 ? ((article.clicks / article.views) * 100).toFixed(1) : '0.0'
                const authorColor = article.author === 'Tiago' 
                  ? 'rgba(30, 64, 175, 0.15)' 
                  : article.author === 'Vicente' 
                    ? 'rgba(153, 27, 27, 0.15)' 
                    : 'hsl(var(--primary) / 0.1)'
                return (
                  <div key={article.slug} className="relative">
                    <div 
                      className="absolute inset-0 rounded"
                      style={{ width: `${percentage}%`, background: authorColor }}
                    />
                    <div className="relative flex items-center justify-between py-2 px-3">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <span className="text-muted-foreground text-sm w-6 flex-shrink-0">{index + 1}</span>
                        <span 
                          className="w-2 h-2 rounded-full flex-shrink-0" 
                          style={{ 
                            background: article.author === 'Tiago' 
                              ? '#1e40af' 
                              : article.author === 'Vicente' 
                                ? '#991b1b' 
                                : 'hsl(var(--primary))' 
                          }}
                        />
                        <span className="text-foreground truncate">
                          {article.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                        <span className="text-foreground font-medium tabular-nums">
                          {article.views.toLocaleString()}
                        </span>
                        <span className="text-muted-foreground tabular-nums w-14 text-right">
                          {ctr}%
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="pt-4 mt-4 border-t border-foreground/[0.06]">
          <button
            onClick={onClose}
            className="w-full py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
