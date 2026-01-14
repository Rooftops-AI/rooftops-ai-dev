"use client"

import { useEffect, useRef, useState } from "react"

interface DotsClusterProps {
  state: "listening" | "thinking" | "speaking" | "idle"
  audioLevel?: number
}

interface Dot {
  x: number
  y: number
  z: number
}

// Fibonacci sphere algorithm for even distribution
function generateSphereDots(count: number): Dot[] {
  const dots: Dot[] = []
  const phi = Math.PI * (3 - Math.sqrt(5)) // golden angle

  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2 // y goes from 1 to -1
    const radius = Math.sqrt(1 - y * y) // radius at y
    const theta = phi * i // golden angle increment

    dots.push({
      x: Math.cos(theta) * radius,
      y: y,
      z: Math.sin(theta) * radius
    })
  }

  return dots
}

export function DotsCluster({ state, audioLevel = 0 }: DotsClusterProps) {
  const [rotation, setRotation] = useState({ x: 0, y: 0 })
  const [breathe, setBreathe] = useState(1)
  const animationRef = useRef<number>()

  const dotCount = 150
  const sphereRadius = 60
  const baseDotSize = 5
  const dots = useRef(generateSphereDots(dotCount)).current

  useEffect(() => {
    let lastTime = performance.now()
    let breatheDirection = 1

    const animate = (currentTime: number) => {
      const deltaTime = (currentTime - lastTime) / 1000
      lastTime = currentTime

      // Rotation speed based on state
      let rotationSpeed = 25
      if (state === "thinking") {
        rotationSpeed = 60
      } else if (state === "speaking") {
        rotationSpeed = 40
      } else if (state === "listening" && audioLevel > 0.1) {
        rotationSpeed = 30 + audioLevel * 50
      }

      setRotation(prev => ({
        x: prev.x + rotationSpeed * deltaTime * 0.3,
        y: prev.y + rotationSpeed * deltaTime
      }))

      // Breathing effect for speaking
      if (state === "speaking") {
        setBreathe(prev => {
          const newVal = prev + breatheDirection * deltaTime * 0.4
          if (newVal > 1.12) breatheDirection = -1
          if (newVal < 0.92) breatheDirection = 1
          return Math.max(0.92, Math.min(1.12, newVal))
        })
      } else if (state === "thinking") {
        setBreathe(0.95 + Math.sin(currentTime / 400) * 0.08)
      } else {
        setBreathe(1)
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [state, audioLevel])

  // Rotate point around Y axis then X axis
  const rotatePoint = (dot: Dot, rotX: number, rotY: number) => {
    const radY = (rotY * Math.PI) / 180
    const radX = (rotX * Math.PI) / 180

    // Rotate around Y axis
    let x = dot.x * Math.cos(radY) - dot.z * Math.sin(radY)
    let z = dot.x * Math.sin(radY) + dot.z * Math.cos(radY)
    let y = dot.y

    // Rotate around X axis
    const newY = y * Math.cos(radX) - z * Math.sin(radX)
    const newZ = y * Math.sin(radX) + z * Math.cos(radX)

    return { x, y: newY, z: newZ }
  }

  // Calculate dot properties based on z-depth
  const getDotStyle = (dot: Dot) => {
    const rotated = rotatePoint(dot, rotation.x, rotation.y)

    // Apply breathing scale
    const scale = sphereRadius * breathe
    const x = rotated.x * scale
    const y = rotated.y * scale
    const z = rotated.z

    // Perspective: dots further away (negative z) are smaller
    const perspective = (z + 1) / 2 // normalize z from [-1,1] to [0,1]
    const size = baseDotSize * (0.4 + perspective * 0.8) // size ranges from 40% to 120%
    const opacity = 0.3 + perspective * 0.7 // opacity ranges from 0.3 to 1.0

    // Color intensity based on depth
    const brightness = 0.5 + perspective * 0.5

    return {
      transform: `translate(${x}px, ${y}px)`,
      width: `${size}px`,
      height: `${size}px`,
      opacity,
      background: `radial-gradient(circle,
        rgba(${Math.round(100 + 80 * brightness)}, ${Math.round(160 + 60 * brightness)}, 255, 1) 0%,
        rgba(59, 130, 246, ${brightness}) 100%)`,
      boxShadow: `0 0 ${6 * brightness}px rgba(59, 130, 246, ${0.6 * brightness})`,
      zIndex: Math.round(perspective * 100)
    }
  }

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ height: "250px", width: "250px" }}
    >
      {/* Ambient glow */}
      <div
        className="absolute rounded-full"
        style={{
          width: "200px",
          height: "200px",
          background: `radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)`,
          filter: "blur(30px)"
        }}
      />

      {/* Dots */}
      <div className="relative" style={{ width: "1px", height: "1px" }}>
        {dots.map((dot, i) => {
          const style = getDotStyle(dot)
          return (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                left: "50%",
                top: "50%",
                marginLeft: "-3px",
                marginTop: "-3px",
                ...style
              }}
            />
          )
        })}
      </div>
    </div>
  )
}
