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
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const context = canvas.getContext("2d")
    if (!context) return

    // Set up responsive dimensions
    const containerWidth = Math.min(width, window.innerWidth - 40)
    const containerHeight = Math.min(height, window.innerHeight - 100)
    const radius = Math.min(containerWidth, containerHeight) / 2.5

    const dpr = window.devicePixelRatio || 1
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

    const render = () => {
      // Clear canvas
      context.clearRect(0, 0, containerWidth, containerHeight)

      const currentScale = projection.scale()
      const scaleFactor = currentScale / radius

      // Draw ocean (globe background)
      context.beginPath()
      context.arc(containerWidth / 2, containerHeight / 2, currentScale, 0, 2 * Math.PI)
      context.fillStyle = "#000000"
      context.fill()
      context.strokeStyle = "#ffffff"
      context.lineWidth = 2 * scaleFactor
      context.stroke()

      if (landFeatures) {
        // Draw graticule
        const graticule = d3.geoGraticule()
        context.beginPath()
        path(graticule())
        context.strokeStyle = "#ffffff"
        context.lineWidth = 1 * scaleFactor
        context.globalAlpha = 0.25
        context.stroke()
        context.globalAlpha = 1

        // Fill land to cover grid inside countries
        context.beginPath()
        landFeatures.features.forEach((feature: any) => {
          path(feature)
        })
        context.fillStyle = "#000000"
        context.fill()

        // Draw land outlines
        context.beginPath()
        landFeatures.features.forEach((feature: any) => {
          path(feature)
        })
        context.strokeStyle = "#ffffff"
        context.lineWidth = 1 * scaleFactor
        context.stroke()
      }
    }

    const loadWorldData = async () => {
      try {
        setIsLoading(true)

        const response = await fetch("/land.json")
        if (!response.ok) throw new Error("Failed to load land data")

        landFeatures = await response.json()

        render()
        setIsLoading(false)
      } catch (err) {
        setError("Failed to load land map data")
        setIsLoading(false)
      }
    }

    // Set up rotation
    const rotation = [0, 0]
    const rotationSpeed = 0.5
    let rotationTimer: d3.Timer | null = null

    const rotate = () => {
      rotation[0] += rotationSpeed
      projection.rotate(rotation)
      render()
    }

    // Load the world data
    loadWorldData().then(() => {
      // Only start rotation after data is loaded
      canvas.style.opacity = "1"
      rotationTimer = d3.timer(rotate)
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
    <div className={`relative ${className}`}>
      <div 
        style={{ 
          maskImage: 'radial-gradient(ellipse 80% 70% at center 45%, black 50%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 70% at center 45%, black 50%, transparent 100%)',
        }}
      >
        <canvas
          ref={canvasRef}
          className="w-full h-auto rounded-2xl bg-background dark transition-opacity duration-1000 ease-in-out"
          style={{ maxWidth: "100%", height: "auto", opacity: 0 }}
        />
      </div>
    </div>
  )
}
