"use client"

import type { HTMLAttributes, ReactNode } from "react"

interface AnimatedSectionProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  delay?: number
}

export function AnimatedSection({ children, className, delay = 0, ...props }: AnimatedSectionProps) {
  // Removed framer-motion entirely - using CSS for simple fade-in
  return (
    <div className={className} {...props}>
      {children}
    </div>
  )
}
