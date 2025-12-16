"use client"

import { useEffect, useRef, useState } from "react"
import * as d3 from "d3"

interface RotatingEarthProps {
  width?: number
  height?: number
  className?: string
}

export default function RotatingEarth({ width = 800, height = 600, className = "" }: RotatingEarthProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)
  const isVisibleRef = useRef(true)

  // Intersection observer to detect visibility
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting
      },
      { threshold: 0.1 }
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return

    const canvas = canvasRef.current
    const context = canvas.getContext("2d")
    if (!context) return

    // Use actual container width for accurate sizing
    const actualContainerWidth = containerRef.current.offsetWidth
    const containerWidth = Math.min(width, actualContainerWidth || window.innerWidth - 40)
    // On mobile (< 768px), make height proportional to width for square-ish globe
    const isMobile = window.innerWidth < 768
    const containerHeight = isMobile 
      ? containerWidth * 0.9  // Slightly less than square to account for globe positioning
      : Math.min(height, window.innerHeight - 100)
    const radius = Math.min(containerWidth, containerHeight) / 2.5

    // Cap DPR at 1.5 for performance (still looks good, much less pixels)
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
    canvas.width = containerWidth * dpr
    canvas.height = containerHeight * dpr
    canvas.style.width = `${containerWidth}px`
    canvas.style.height = `${containerHeight}px`
    context.scale(dpr, dpr)

    // Create projection and path generator for Canvas
    const projection = d3
      .geoOrthographic()
      .scale(radius)
      .translate([containerWidth / 2, containerHeight / 2])
      .clipAngle(90)

    const path = d3.geoPath().projection(projection).context(context)

    let landFeatures: any
    const graticule = d3.geoGraticule()()
    let animationProgress = 0
    const animationDuration = 120 // frames (~2 seconds)

    const render = () => {
      // Clear canvas
      context.clearRect(0, 0, containerWidth, containerHeight)

      const currentScale = projection.scale()
      const scaleFactor = currentScale / radius
      const centerX = containerWidth / 2
      const centerY = containerHeight / 2

      // Draw ocean (globe background)
      context.beginPath()
      context.arc(centerX, centerY, currentScale, 0, 2 * Math.PI)
      context.fillStyle = "#000000"
      context.fill()
      context.strokeStyle = "#ffffff"
      context.lineWidth = 2 * scaleFactor
      context.stroke()

      if (landFeatures) {
        // Draw graticule with reveal animation
        if (animationProgress > 0) {
          const progress = Math.min(animationProgress / animationDuration, 1)
          const eased = 1 - Math.pow(1 - progress, 3) // ease out cubic
          
          context.save()
          
          // Create clip path that reveals from top and bottom toward center
          context.beginPath()
          context.rect(0, 0, containerWidth, centerY * eased)
          context.rect(0, containerHeight - centerY * eased, containerWidth, centerY * eased)
          context.clip()
          
          // Draw main graticule lines
          context.beginPath()
          path(graticule)
          context.strokeStyle = "#ffffff"
          context.lineWidth = 1 * scaleFactor
          context.globalAlpha = 0.25
          context.stroke()
          context.globalAlpha = 1
          
          context.restore()
        }

        // Batch: Build single path for all land features, then fill and stroke once
        context.beginPath()
        landFeatures.features.forEach((feature: any) => {
          path(feature)
        })
        // Fill and stroke in one go
        context.fillStyle = "#000000"
        context.fill()
        context.strokeStyle = "#ffffff"
        context.lineWidth = 1 * scaleFactor
        context.stroke()
      }
      
      if (animationProgress < animationDuration) {
        animationProgress++
      }
    }

    const loadWorldData = async () => {
      try {
        const response = await fetch("/land.json")
        if (!response.ok) throw new Error("Failed to load land data")

        landFeatures = await response.json()
      } catch (err) {
        setError("Failed to load land map data")
      }
    }

    // Set up rotation
    const rotation = [0, 0]
    const rotationSpeed = 0.35 // Adjusted for 45fps
    let lastFrameTime = 0
    const frameInterval = 1000 / 45 // 45fps
    let rotationTimer: d3.Timer | null = null

    const rotate = (elapsed: number) => {
      if (!isVisibleRef.current) return // Skip when not visible
      
      if (elapsed - lastFrameTime < frameInterval) return
      lastFrameTime = elapsed
      
      rotation[0] += rotationSpeed
      projection.rotate(rotation)
      render()
    }

    // Load the world data
    loadWorldData().then(() => {
      // Double requestAnimationFrame to ensure paint is complete
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          render()
          canvas.style.opacity = "1"
          // Small delay before starting animation
          setTimeout(() => {
            rotationTimer = d3.timer(rotate)
          }, 50)
        })
      })
    })

    // Cleanup
    return () => {
      rotationTimer?.stop()
    }
  }, [width, height])

  if (error) {
    return (
      <div className={`dark flex items-center justify-center bg-card rounded-2xl p-8 ${className}`}>
        <div className="text-center">
          <p className="dark text-destructive font-semibold mb-2">Error loading Earth visualization</p>
          <p className="dark text-muted-foreground text-sm">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div 
      ref={containerRef} 
      className={`relative aspect-[1/0.9] md:aspect-auto ${className}`} 
      style={{ 
        willChange: "transform", 
        transform: "translateZ(0)",
      }}
    >
      <div 
        className="absolute inset-0 md:relative"
        style={{ 
          maskImage: 'radial-gradient(circle at center 50%, black 52%, transparent 58%)',
          WebkitMaskImage: 'radial-gradient(circle at center 50%, black 52%, transparent 58%)',
          transform: "translateZ(0)",
        }}
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full md:h-auto rounded-2xl transition-opacity duration-1000 ease-in-out"
          style={{ 
            maxWidth: "100%", 
            opacity: 0,
            willChange: "contents",
            transform: "translateZ(0)",
          }}
        />
      </div>
    </div>
  )
}
