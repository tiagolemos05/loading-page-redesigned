'use client'

import { useEffect } from 'react'

interface SourceData {
  referrer: string | null
  count: number
}

interface SourcesModalProps {
  isOpen: boolean
  sources: SourceData[]
  onClose: () => void
}

export function SourcesModal({ isOpen, sources, onClose }: SourcesModalProps) {
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

  const totalViews = sources.reduce((sum, s) => sum + s.count, 0)

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
            All Traffic Sources
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
          {sources.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No traffic data yet</p>
          ) : (
            <div className="space-y-3">
              {sources.map((source, index) => {
                const percentage = totalViews > 0 ? (source.count / totalViews) * 100 : 0
                return (
                  <div key={source.referrer || 'direct'} className="relative">
                    <div 
                      className="absolute inset-0 bg-primary/10 rounded"
                      style={{ width: `${percentage}%` }}
                    />
                    <div className="relative flex items-center justify-between py-2 px-3">
                      <div className="flex items-center gap-3">
                        <span className="text-muted-foreground text-sm w-6">{index + 1}</span>
                        <span className="text-foreground">
                          {source.referrer || 'Direct'}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-muted-foreground text-sm">
                          {percentage.toFixed(1)}%
                        </span>
                        <span className="text-foreground font-medium tabular-nums">
                          {source.count.toLocaleString()}
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
