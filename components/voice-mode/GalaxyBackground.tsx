"use client"

import { useMemo } from "react"

export function GalaxyBackground() {
  const stars = useMemo(
    () =>
      Array.from({ length: 120 }).map((_, i) => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 1 + Math.random() * 2,
        duration: 30 + Math.random() * 30,
        delay: Math.random() * 10,
        opacity: 0.1 + Math.random() * 0.2
      })),
    []
  )

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {stars.map((star, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white animate-galaxy-drift"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: star.opacity,
            animationDuration: `${star.duration}s`,
            animationDelay: `${star.delay}s`,
            willChange: "transform"
          }}
        />
      ))}
    </div>
  )
}
