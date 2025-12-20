"use client"

import Link from "next/link"
import { ArrowLeft, Link as LinkIcon } from "lucide-react"
import { useState } from "react"
import { ThemeToggle } from "@/components/theme-toggle"

export function BlogHeader() {
  return (
    <header className="w-full py-6 px-6">
      <div className="w-full max-w-[1320px] mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-3 group">
            <span className="text-foreground text-xl font-semibold">Node Wave</span>
          </Link>
          <span className="text-foreground/20">/</span>
          <Link href="/blog" className="text-muted-foreground hover:text-foreground transition-colors">
            Blog
          </Link>
        </div>
        <div className="flex items-center gap-6">
          <ThemeToggle />
          <Link 
            href="/#contact-section" 
            className="text-muted-foreground hover:text-foreground text-sm transition-colors"
          >
            Get in touch
          </Link>
        </div>
      </div>
    </header>
  )
}

export function BlogBackLink() {
  return (
    <Link 
      href="/blog" 
      className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm transition-colors"
    >
      <ArrowLeft className="w-4 h-4" />
      Blog
    </Link>
  )
}

export function CopyUrlButton() {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 text-primary hover:text-primary/80 text-sm transition-colors"
    >
      <LinkIcon className="w-3.5 h-3.5" />
      {copied ? "Copied!" : "Copy URL"}
    </button>
  )
}

export function ReadingTime({ minutes }: { minutes: number }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-muted-foreground text-sm">
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
      {minutes} min read
    </span>
  )
}
