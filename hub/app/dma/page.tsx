"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { ArrowLeft, Wrench, Sparkles, Clock, MessageCircle } from "lucide-react"
import { usePageTransition } from "@/hooks/use-page-transition"
import { Snowflakes } from "@/components/snowflakes"

export default function DMAPage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)
  const { isLoading } = usePageTransition()

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  if (isLoading) return null

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#222831] via-[#393E46] to-[#222831]">
      {/* Snowflakes */}
      <Snowflakes />

      {/* Interactive Mouse Follower */}
      <div
        className="fixed w-6 h-6 bg-white/30 rounded-full blur-sm pointer-events-none z-50 transition-transform duration-100"
        style={{
          left: mousePosition.x - 12,
          top: mousePosition.y - 12,
          transform: isHovered ? "scale(2)" : "scale(1)",
        }}
      ></div>

      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2740%27 height=%2740%27 viewBox=%270 0 40 40%27 xmlns=%27http://www.w3.org/2000/svg%3E%3Cg fill=%27%23ffffff%27 fillOpacity=%270.05%27%3E%3Cpath d=%27M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z%27/%3E%3C/g%3E%3C/svg%3E')] animate-pulse"></div>

        {/* Floating Elements */}
        <div className="absolute top-1/3 left-1/5 w-20 h-20 bg-[#00ADB5]/20 rounded-full blur-xl animate-bounce delay-300"></div>
        <div className="absolute bottom-1/3 right-1/5 w-16 h-16 bg-[#00ADB5]/30 rounded-full blur-xl animate-bounce delay-700"></div>
        <div className="absolute top-2/3 left-2/3 w-24 h-24 bg-[#00ADB5]/10 rounded-full blur-xl animate-bounce delay-1000"></div>

        {/* Rotating Gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-spin-slow"></div>
      </div>

      {/* Back Button */}
      <div className="absolute top-8 left-8 z-20">
        <Link
          href="/"
          className="group flex items-center space-x-2 bg-[#393E46]/80 backdrop-blur-sm rounded-full px-6 py-3 text-[#EEEEEE] hover:bg-[#00ADB5]/20 transition-all duration-300 transform hover:scale-105"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <ArrowLeft className="w-5 h-5 group-hover:animate-bounce" />
          <span>Back to Hub</span>
        </Link>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <div className="text-center max-w-4xl">
          {/* Animated Icons */}
          <div className="flex justify-center space-x-8 mb-8">
            <Wrench className="w-16 h-16 text-[#00ADB5] animate-bounce" />
            <Sparkles className="w-16 h-16 text-[#EEEEEE] animate-pulse" />
            <Clock className="w-16 h-16 text-[#00ADB5] animate-spin" />
          </div>

          {/* Main Title */}
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 animate-fade-in">
            <span className="bg-gradient-to-r from-[#00ADB5] via-[#EEEEEE] to-[#00ADB5] bg-clip-text text-transparent">
              Site Under Construction
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-2xl md:text-3xl text-gray-300 mb-8 animate-fade-in delay-300">
            Razzosx DMA is coming soon!
          </p>

          {/* Description */}
          <p className="text-lg text-gray-400 mb-12 animate-fade-in delay-500 max-w-2xl mx-auto">
            We're working hard to bring you something amazing. Stay tuned for updates and exciting new features.
          </p>

          {/* Discord Button */}
          <div className="mb-8">
            <a
              href="https://discord.gg/razzosxdma"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center space-x-3 bg-gradient-to-r from-[#00ADB5] to-[#393E46] rounded-full px-8 py-4 text-[#EEEEEE] hover:from-[#393E46] hover:to-[#00ADB5] transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <MessageCircle className="w-6 h-6 animate-pulse" />
              <span className="text-lg font-semibold">Join Discord for Purchases</span>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
            </a>
            <p className="text-sm text-gray-400 mt-3">Make purchases directly through our Discord server</p>
          </div>

          {/* Interactive Elements */}
          <div className="flex justify-center space-x-4 mb-12">
            <div className="w-4 h-4 bg-[#00ADB5] rounded-full animate-ping"></div>
            <div className="w-4 h-4 bg-[#EEEEEE] rounded-full animate-ping delay-200"></div>
            <div className="w-4 h-4 bg-[#00ADB5] rounded-full animate-ping delay-400"></div>
            <div className="w-4 h-4 bg-[#EEEEEE] rounded-full animate-ping delay-600"></div>
          </div>

          {/* Progress Bar Animation */}
          <div className="w-full max-w-md mx-auto bg-white/10 rounded-full h-2 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#00ADB5] to-[#EEEEEE] rounded-full animate-pulse"></div>
          </div>
          <p className="text-sm text-gray-400 mt-2">Building something extraordinary...</p>
        </div>
      </div>
    </div>
  )
}
