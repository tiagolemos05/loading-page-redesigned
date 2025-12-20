'use client'

import { useEffect } from 'react'

export function ForceDarkMode() {
  useEffect(() => {
    document.documentElement.classList.remove('light')
  }, [])

  return null
}
