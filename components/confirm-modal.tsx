'use client'

import { useEffect } from 'react'

interface ConfirmModalProps {
  isOpen: boolean
  title: string
  message: string
  confirmText: string
  confirmVariant?: 'primary' | 'danger'
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText,
  confirmVariant = 'primary',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, onCancel])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onCancel}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 bg-gradient-to-b from-foreground/[0.06] to-foreground/[0.03] border border-foreground/[0.08] rounded-2xl p-6">
        <h2 className="text-foreground text-xl font-semibold mb-2">
          {title}
        </h2>
        <p className="text-muted-foreground mb-6">
          {message}
        </p>
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-sm rounded-full font-medium transition-colors ${
              confirmVariant === 'danger'
                ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
