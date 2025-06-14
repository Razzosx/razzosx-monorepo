"use client"
import { useState } from "react"
import { ExternalLink, Zap, ShoppingBag } from "lucide-react"
import { usePageTransition } from "@/hooks/use-page-transition"
import { Snowflakes } from "@/components/snowflakes"

export default function HomePage() {
  const [hoveredButton, setHoveredButton] = useState<string | null>(null)
  const { isLoading } = usePageTransition()

  if (isLoading) return null

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#222831] via-[#393E46] to-[#222831]">
      {/* Snowflakes */}
      <Snowflakes />

      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2760%27 height=%2760%27 viewBox=%270 0 60 60%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cg fill=%27none%27 fillRule=%27evenodd%27%3E%3Cg fill=%27%239C92AC%27 fillOpacity=%270.1%27%3E%3Ccircle cx=%2730%27 cy=%2730%27 r=%274%27/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50"></div>

        {/* Floating Orbs - More subtle */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-[#00ADB5]/10 rounded-full blur-xl animate-bounce"></div>
        <div className="absolute top-3/4 right-1/4 w-24 h-24 bg-[#00ADB5]/15 rounded-full blur-xl animate-bounce delay-1000"></div>
        <div className="absolute top-1/2 left-3/4 w-40 h-40 bg-[#00ADB5]/5 rounded-full blur-xl animate-bounce delay-500"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <div className="text-center mb-12">
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-4 animate-fade-in">
            <span className="bg-gradient-to-r from-[#00ADB5] via-[#EEEEEE] to-[#00ADB5] bg-clip-text text-transparent animate-text-breathe">
              Razzosx
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-[#EEEEEE] animate-fade-in delay-300">Routing Hub</p>
        </div>

        <div className="flex flex-col md:flex-row gap-8 w-full max-w-2xl">
          {/* Razzosx Button */}
          <a
            href="https://razzosx.sellhub.cx/"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex-1 cursor-pointer"
            onMouseEnter={() => setHoveredButton("razzosx")}
            onMouseLeave={() => setHoveredButton(null)}
          >
            {/* Hover glow effect */}
            <div
              className={`absolute inset-0 bg-gradient-to-r from-[#00ADB5] to-[#393E46] rounded-2xl blur-lg transition-all duration-500 ${
                hoveredButton === "razzosx" ? "opacity-60 scale-105" : "opacity-0 scale-100"
              }`}
            ></div>

            {/* Main button */}
            <div
              className={`relative bg-gradient-to-r from-[#00ADB5] to-[#393E46] rounded-2xl p-8 transition-all duration-300 ${
                hoveredButton === "razzosx" ? "transform scale-105 shadow-2xl" : "transform scale-100 shadow-lg"
              }`}
            >
              <div className="flex items-center justify-center space-x-3">
                <Zap
                  className={`w-8 h-8 text-[#EEEEEE] transition-transform duration-300 ${
                    hoveredButton === "razzosx" ? "animate-bounce" : ""
                  }`}
                />
                <span className="text-2xl font-bold text-[#EEEEEE]">Razzosx</span>
                <ExternalLink
                  className={`w-6 h-6 text-[#EEEEEE]/80 transition-all duration-300 ${
                    hoveredButton === "razzosx" ? "opacity-100 transform translate-x-1" : "opacity-60"
                  }`}
                />
              </div>
              <p className="text-center text-[#EEEEEE]/90 mt-2">Website for Cheats</p>

              {/* Hover overlay */}
              {hoveredButton === "razzosx" && (
                <div className="absolute inset-0 bg-white/5 rounded-2xl animate-pulse"></div>
              )}
            </div>
          </a>

          {/* Razzosx DMA Button - No redirection */}
          <div
            className="group relative flex-1 cursor-pointer"
            onMouseEnter={() => setHoveredButton("store")}
            onMouseLeave={() => setHoveredButton(null)}
          >
            {/* Hover glow effect */}
            <div
              className={`absolute inset-0 bg-gradient-to-r from-[#393E46] to-[#222831] rounded-2xl blur-lg transition-all duration-500 ${
                hoveredButton === "store" ? "opacity-60 scale-105" : "opacity-0 scale-100"
              }`}
            ></div>

            {/* Main button */}
            <div
              className={`relative bg-gradient-to-r from-[#393E46] to-[#222831] rounded-2xl p-8 transition-all duration-300 border border-[#00ADB5]/20 ${
                hoveredButton === "store"
                  ? "transform scale-105 shadow-2xl border-[#00ADB5]/40"
                  : "transform scale-100 shadow-lg"
              }`}
            >
              {/* NEW badge in corner */}
              <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse shadow-lg">
                NEW
              </div>

              <div className="flex items-center justify-center space-x-3">
                {/* Custom emoji with shopping bag icon */}
                <div className="relative flex items-center">
                  <ShoppingBag
                    className={`w-8 h-8 text-[#00ADB5] transition-all duration-300 ${
                      hoveredButton === "store" ? "animate-bounce" : ""
                    }`}
                  />
                </div>
                <span className="text-2xl font-bold text-[#EEEEEE]">Razzosx DMA</span>
                <ExternalLink
                  className={`w-6 h-6 text-[#EEEEEE]/80 transition-all duration-300 ${
                    hoveredButton === "store" ? "opacity-100 transform translate-x-1" : "opacity-60"
                  }`}
                />
              </div>
              <p className="text-center text-[#EEEEEE]/90 mt-2">Website for DMA</p>

              {/* Hover overlay */}
              {hoveredButton === "store" && (
                <div className="absolute inset-0 bg-white/5 rounded-2xl animate-pulse"></div>
              )}
            </div>
          </div>
        </div>

        {/* Decorative Elements - More subtle */}
        <div className="mt-16 flex space-x-4">
          <div className="w-2 h-2 bg-[#00ADB5] rounded-full animate-ping opacity-60"></div>
          <div className="w-2 h-2 bg-[#EEEEEE] rounded-full animate-ping delay-100 opacity-40"></div>
          <div className="w-2 h-2 bg-[#00ADB5] rounded-full animate-ping delay-200 opacity-60"></div>
        </div>
      </div>
    </div>
  )
}
