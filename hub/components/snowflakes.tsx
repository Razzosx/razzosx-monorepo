"use client"

import { useEffect, useRef } from "react"

interface Snowflake {
  id: number
  x: number
  y: number
  size: number
  speed: number
  opacity: number
  color: string
  drift: number
}

export function Snowflakes() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const snowflakesRef = useRef<Snowflake[]>([])
  const animationRef = useRef<number>()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Create snowflakes
    const createSnowflakes = () => {
      const snowflakes: Snowflake[] = []
      const colors = ["#00ADB5", "#EEEEEE", "#393E46"]

      for (let i = 0; i < 50; i++) {
        snowflakes.push({
          id: i,
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 3 + 1,
          speed: Math.random() * 1 + 0.5,
          opacity: Math.random() * 0.3 + 0.1,
          color: colors[Math.floor(Math.random() * colors.length)],
          drift: Math.random() * 0.5 - 0.25,
        })
      }

      snowflakesRef.current = snowflakes
    }

    // Animate snowflakes
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      snowflakesRef.current.forEach((snowflake) => {
        // Update position
        snowflake.y += snowflake.speed
        snowflake.x += snowflake.drift

        // Reset snowflake when it goes off screen
        if (snowflake.y > canvas.height) {
          snowflake.y = -10
          snowflake.x = Math.random() * canvas.width
        }

        if (snowflake.x > canvas.width) {
          snowflake.x = 0
        } else if (snowflake.x < 0) {
          snowflake.x = canvas.width
        }

        // Draw snowflake
        ctx.save()
        ctx.globalAlpha = snowflake.opacity
        ctx.fillStyle = snowflake.color
        ctx.beginPath()
        ctx.arc(snowflake.x, snowflake.y, snowflake.size, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    createSnowflakes()
    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  return (
    <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" style={{ mixBlendMode: "screen" }} />
  )
}
