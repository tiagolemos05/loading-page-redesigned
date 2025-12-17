"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export function BlogHeader() {
  return (
    <header className="w-full py-6 px-6 border-b border-foreground/[0.06]">
      <div className="max-w-3xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3 group">
            <span className="text-foreground text-xl font-semibold">Node Wave</span>
          </Link>
          <span className="text-foreground/20">/</span>
          <Link href="/blog" className="text-muted-foreground hover:text-foreground transition-colors">
            Blog
          </Link>
        </div>
        <Link 
          href="/#contact-section" 
          className="text-muted-foreground hover:text-foreground text-sm transition-colors"
        >
          Get in touch
        </Link>
      </div>
    </header>
  )
}

export function BlogBackLink() {
  return (
    <Link 
      href="/blog" 
      className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm transition-colors mb-8"
    >
      <ArrowLeft className="w-4 h-4" />
      Back to blog
    </Link>
  )
}
