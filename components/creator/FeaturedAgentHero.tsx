"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react"

interface Agent {
  id: string
  name: string
  title: string
  avatar?: string
  avatarUrl?: string
  gradient: string
  description: string
  categories: string[]
}

interface FeaturedAgentHeroProps {
  featuredAgents: Agent[]
}

export function FeaturedAgentHero({ featuredAgents }: FeaturedAgentHeroProps) {
  const { locale, workspaceid: workspaceId } = useParams() as {
    locale: string
    workspaceid: string
  }

  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  // Auto-rotation every 5 seconds
  useEffect(() => {
    if (isPaused || featuredAgents.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % featuredAgents.length)
    }, 5000) // 5 seconds

    return () => clearInterval(interval)
  }, [isPaused, featuredAgents.length])

  // Manual navigation
  const goToPrevious = () => {
    setCurrentIndex(prev =>
      prev === 0 ? featuredAgents.length - 1 : prev - 1
    )
  }

  const goToNext = () => {
    setCurrentIndex(prev => (prev + 1) % featuredAgents.length)
  }

  if (featuredAgents.length === 0) return null

  return (
    <div
      className="relative mb-12 h-[400px] overflow-hidden rounded-2xl shadow-2xl"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Agent slides */}
      {featuredAgents.map((agent, idx) => (
        <div
          key={agent.id}
          className={cn(
            "absolute inset-0 transition-opacity duration-700",
            idx === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
          )}
        >
          <div
            className={cn(
              "flex h-full items-center bg-gradient-to-br px-12",
              agent.gradient
            )}
          >
            {/* Left: Agent info */}
            <div className="flex-1">
              <p className="mb-2 text-sm font-medium uppercase tracking-wider text-white/80">
                Featured Agent
              </p>
              <h2 className="mb-4 text-4xl font-bold text-white">
                {agent.name}
              </h2>
              <p className="mb-2 text-xl font-medium text-white/95">
                {agent.title}
              </p>
              <p className="mb-6 max-w-xl text-lg leading-relaxed text-white/90">
                {agent.description}
              </p>

              {/* Categories */}
              <div className="mb-6 flex flex-wrap gap-2">
                {agent.categories.map(cat => (
                  <span
                    key={cat}
                    className="rounded-full bg-white/20 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm"
                  >
                    {cat}
                  </span>
                ))}
              </div>

              {/* CTA Button */}
              <Link href={`/${locale}/${workspaceId}/creator/${agent.id}`}>
                <button className="rounded-lg bg-white px-6 py-3 font-semibold text-gray-900 shadow-lg transition-all duration-150 hover:scale-105 hover:shadow-xl">
                  Try {agent.name.split(" ")[0]} Now
                </button>
              </Link>
            </div>

            {/* Right: Agent avatar */}
            <div className="hidden flex-shrink-0 lg:block">
              <img
                src={agent.avatar || agent.avatarUrl}
                alt={agent.name}
                className="size-64 rounded-full shadow-2xl ring-4 ring-white/30"
              />
            </div>
          </div>
        </div>
      ))}

      {/* Navigation arrows */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/30 p-2 text-white backdrop-blur-sm transition-all hover:bg-black/50"
        aria-label="Previous agent"
      >
        <IconChevronLeft size={24} />
      </button>
      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/30 p-2 text-white backdrop-blur-sm transition-all hover:bg-black/50"
        aria-label="Next agent"
      >
        <IconChevronRight size={24} />
      </button>

      {/* Navigation dots */}
      <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 gap-2">
        {featuredAgents.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={cn(
              "h-2 rounded-full transition-all duration-300",
              idx === currentIndex
                ? "w-8 bg-white"
                : "w-2 bg-white/50 hover:bg-white/70"
            )}
            aria-label={`Go to agent ${idx + 1}`}
          />
        ))}
      </div>

      {/* Progress bar (optional visual indicator) */}
      {!isPaused && (
        <div className="absolute bottom-0 left-0 right-0 z-20 h-1 bg-white/20">
          <div
            className="h-full bg-white transition-all"
            style={{
              width: "0%",
              animation: "progress 5s linear infinite"
            }}
          />
        </div>
      )}

      <style jsx>{`
        @keyframes progress {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }
      `}</style>
    </div>
  )
}
