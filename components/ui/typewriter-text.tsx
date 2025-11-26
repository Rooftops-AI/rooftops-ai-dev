// @ts-nocheck
"use client"
import { useState, useEffect } from "react"

export default function TypewriterText({ text }: { text: string }) {
  const [displayedText, setDisplayedText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex])
        setCurrentIndex(prev => prev + 1)
      }, 50) // 50ms per character for quick typewriter effect

      return () => clearTimeout(timeout)
    }
  }, [currentIndex, text])

  return <span>{displayedText}</span>
}
