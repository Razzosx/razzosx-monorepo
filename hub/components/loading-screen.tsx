"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"

interface LoadingScreenProps {
  onLoadingComplete: () => void
}

export function LoadingScreen({ onLoadingComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0)
  const [fadeOut, setFadeOut] = useState(false)
  const particlesRef = useRef<HTMLDivElement>(null)

  // Create particles
  useEffect(() => {
    if (!particlesRef.current) return

    const container = particlesRef.current
    const particleCount = 30

    // Clear any existing particles
    container.innerHTML = ""

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement("div")
      const size = Math.random() * 6 + 2

      particle.className = "absolute rounded-full"
      particle.style.width = `${size}px`
      particle.style.height = `${size}px`
      particle.style.backgroundColor = Math.random() > 0.5 ? "#00ADB5" : "#EEEEEE"
      particle.style.opacity = (Math.random() * 0.6 + 0.2).toString()

      // Random position
      particle.style.left = `${Math.random() * 100}%`
      particle.style.top = `${Math.random() * 100}%`

      // Animation
      particle.style.animation = `
        float ${Math.random() * 10 + 10}s linear infinite,
        pulse ${Math.random() * 2 + 1}s ease-in-out infinite alternate
      `
      particle.style.animationDelay = `${Math.random() * 5}s`

      container.appendChild(particle)
    }
  }, [])

  // Progress animation
  useEffect(() => {
    const timer = setTimeout(() => {
      if (progress < 100) {
        setProgress((prev) => Math.min(prev + (1 + Math.random() * 3), 100))
      } else {
        setFadeOut(true)
        setTimeout(() => {
          onLoadingComplete()
        }, 800)
      }
    }, 30)

    return () => clearTimeout(timer)
  }, [progress, onLoadingComplete])

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#222831] transition-all duration-800 ease-out overflow-hidden ${
        fadeOut ? "opacity-0 scale-95" : "opacity-100 scale-100"
      }`}
    >
      {/* Animated background */}
      <div className="absolute inset-0 bg-[#222831]">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#00ADB5]/20 via-transparent to-transparent animate-pulse"></div>
          <div
            className="absolute bottom-0 right-0 w-full h-full bg-gradient-to-tl from-[#00ADB5]/20 via-transparent to-transparent animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
        </div>
      </div>

      {/* Particles container */}
      <div ref={particlesRef} className="absolute inset-0 overflow-hidden"></div>

      {/* Dynamic Loading Indicator Container */}
      <div className="relative flex flex-col items-center justify-center">
        {/* Logo container with animations */}
        <div className="relative w-40 h-40 mb-8 animate-float">
          {/* Glowing background for logo */}
          <div className="absolute inset-0 rounded-full bg-[#00ADB5]/20 blur-xl animate-pulse"></div>

          {/* Logo with animations */}
          <div className="absolute inset-0 flex items-center justify-center animate-logo-pulse">
            <div className="relative w-full h-full">
              <Image
                src="/logo.png"
                alt="Razzosx Logo"
                width={160}
                height={160}
                className="object-contain animate-logo-rotate"
              />

              {/* Animated overlay effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent animate-shine"></div>
            </div>
          </div>

          {/* Rotating elements around logo */}
          <div className="absolute inset-0 animate-spin-slow">
            <div className="w-full h-full rounded-full border-t-2 border-[#00ADB5] opacity-20"></div>
          </div>
          <div
            className="absolute inset-0 animate-spin-slow"
            style={{ animationDirection: "reverse", animationDuration: "3s" }}
          >
            <div className="w-full h-full rounded-full border-b-2 border-[#00ADB5] opacity-40"></div>
          </div>

          {/* Orbiting dot */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-[#00ADB5] animate-orbit"></div>
        </div>

        {/* Progress bar with animated gradient */}
        <div className="w-64 h-2 bg-[#393E46] rounded-full overflow-hidden mb-6 relative">
          <div
            className="h-full bg-gradient-to-r from-[#00ADB5] via-[#EEEEEE] to-[#00ADB5] animate-gradient-x"
            style={{ width: `${progress}%`, transition: "width 0.3s ease-out" }}
          ></div>

          {/* Animated glow effect */}
          <div
            className="absolute top-0 left-0 h-full w-10 bg-white/30 blur-sm animate-shimmer"
            style={{ transform: `translateX(${progress}%)` }}
          ></div>
        </div>

        {/* Percentage counter */}
        <div className="text-[#EEEEEE] font-medium tracking-wider mb-4">
          <span className="inline-block min-w-[4ch] text-center text-lg">{Math.floor(progress)}%</span>
        </div>

        {/* Central Text Display - Dynamic Loading Indicator */}
        <div className="flex flex-col items-center justify-center">
          {/* Animated curved LOADING text - Central Display */}
          <div className="loading-text-container mb-6">
            <span className="loading-letter animate-letter" style={{ animationDelay: "0ms" }}>
              L
            </span>
            <span className="loading-letter animate-letter" style={{ animationDelay: "100ms" }}>
              O
            </span>
            <span className="loading-letter animate-letter" style={{ animationDelay: "200ms" }}>
              A
            </span>
            <span className="loading-letter animate-letter" style={{ animationDelay: "300ms" }}>
              D
            </span>
            <span className="loading-letter animate-letter" style={{ animationDelay: "400ms" }}>
              I
            </span>
            <span className="loading-letter animate-letter" style={{ animationDelay: "500ms" }}>
              N
            </span>
            <span className="loading-letter animate-letter" style={{ animationDelay: "600ms" }}>
              G
            </span>
          </div>

          {/* Animated dots indicator */}
          <div className="flex space-x-2">
            <div className="w-2 h-2 bg-[#00ADB5] rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-[#00ADB5] rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
            <div className="w-2 h-2 bg-[#00ADB5] rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
          </div>
        </div>
      </div>

      {/* Animated corner elements */}
      <div className="absolute top-4 left-4 w-20 h-20">
        <div className="w-full h-0.5 bg-[#00ADB5]/50 animate-expand"></div>
        <div className="h-full w-0.5 bg-[#00ADB5]/50 animate-expand"></div>
      </div>
      <div className="absolute top-4 right-4 w-20 h-20">
        <div className="w-full h-0.5 bg-[#00ADB5]/50 animate-expand"></div>
        <div className="h-full w-0.5 bg-[#00ADB5]/50 animate-expand absolute right-0"></div>
      </div>
      <div className="absolute bottom-4 left-4 w-20 h-20">
        <div className="w-full h-0.5 bg-[#00ADB5]/50 animate-expand absolute bottom-0"></div>
        <div className="h-full w-0.5 bg-[#00ADB5]/50 animate-expand"></div>
      </div>
      <div className="absolute bottom-4 right-4 w-20 h-20">
        <div className="w-full h-0.5 bg-[#00ADB5]/50 animate-expand absolute bottom-0"></div>
        <div className="h-full w-0.5 bg-[#00ADB5]/50 animate-expand absolute right-0"></div>
      </div>
    </div>
  )
}
