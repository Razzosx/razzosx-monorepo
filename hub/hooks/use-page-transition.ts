"use client"

import { useState, useEffect } from "react"

export function usePageTransition() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading time (min 1.5 seconds, max 3 seconds)
    const loadingTime = 1500 + Math.random() * 1500

    const timer = setTimeout(() => {
      setIsLoading(false)
    }, loadingTime)

    return () => clearTimeout(timer)
  }, [])

  return { isLoading }
}
