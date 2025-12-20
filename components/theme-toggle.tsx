'use client'

import { useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem('blog-theme') as Theme | null
    if (stored) {
      setTheme(stored)
      document.documentElement.classList.toggle('light', stored === 'light')
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      const systemTheme = prefersDark ? 'dark' : 'light'
      setTheme(systemTheme)
      document.documentElement.classList.toggle('light', systemTheme === 'light')
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    localStorage.setItem('blog-theme', newTheme)
    document.documentElement.classList.toggle('light', newTheme === 'light')
  }

  // Don't render anything until mounted to avoid hydration mismatch
  if (!mounted || theme === null) {
    return (
      <div className="hidden md:flex items-center gap-3">
        <span className="text-sm text-muted-foreground">Light Mode</span>
        <div className="w-14 h-7 rounded-full bg-muted" />
        <span className="text-sm text-muted-foreground">Dark Mode</span>
      </div>
    )
  }

  const isDark = theme === 'dark'

  return (
    <div className="hidden md:flex items-center gap-3">
      <span 
        className={`text-sm transition-colors ${
          !isDark ? 'text-[#0A80FE] font-medium' : 'text-muted-foreground'
        }`}
      >
        Light Mode
      </span>
      
      <button
        onClick={toggleTheme}
        className={`relative w-14 h-7 rounded-full transition-colors ${
          isDark ? 'bg-primary' : 'bg-[#0A80FE]'
        }`}
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      >
        <span
          className={`absolute top-0.5 w-6 h-6 rounded-full bg-white flex items-center justify-center transition-transform ${
            isDark ? 'translate-x-7' : 'translate-x-0.5'
          }`}
        >
          {isDark ? (
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              strokeWidth={1.5} 
              stroke="currentColor" 
              className="w-4 h-4 text-[#4B5563]"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" 
              />
            </svg>
          ) : (
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              strokeWidth={1.5} 
              stroke="currentColor" 
              className="w-4 h-4 text-[#0A80FE]"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" 
              />
            </svg>
          )}
        </span>
      </button>
      
      <span 
        className={`text-sm transition-colors ${
          isDark ? 'text-primary font-medium' : 'text-muted-foreground'
        }`}
      >
        Dark Mode
      </span>
    </div>
  )
}
