"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { LoadingScreen } from "@/components/loading-screen"

interface ClientLayoutProps {
  children: React.ReactNode
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [showContent, setShowContent] = useState(false)
  const pathname = usePathname()

  // Reset loading state when navigating between pages
  useEffect(() => {
    setIsLoading(true)
    setShowContent(false)
  }, [pathname])

  const handleLoadingComplete = () => {
    setIsLoading(false)
    // Small delay to ensure smooth transition
    setTimeout(() => {
      setShowContent(true)
    }, 100)
  }

  return (
    <div className="min-h-screen bg-[#222831]">
      {isLoading && <LoadingScreen onLoadingComplete={handleLoadingComplete} />}
      <div
        className={`min-h-screen transition-all duration-1000 ease-out ${
          showContent ? "opacity-100 transform translate-y-0" : "opacity-0 transform translate-y-4"
        }`}
        style={{
          visibility: isLoading ? "hidden" : "visible",
          backgroundColor: "#222831",
        }}
      >
        {children}
      </div>
    </div>
  )
}
