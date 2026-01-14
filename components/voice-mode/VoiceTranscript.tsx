"use client"

import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

interface Message {
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface VoiceTranscriptProps {
  messages: Message[]
}

export function VoiceTranscript({ messages }: VoiceTranscriptProps) {
  const transcriptRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight
    }
  }, [messages])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  return (
    <div className="relative flex h-full w-full flex-col">
      <div
        ref={transcriptRef}
        className="flex-1 overflow-y-auto px-6 pb-8 pt-16 md:px-12"
        style={{
          maskImage:
            "linear-gradient(to bottom, transparent 0%, black 10%, black 85%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent 0%, black 10%, black 85%, transparent 100%)"
        }}
      >
        <div className="mx-auto max-w-3xl space-y-4">
          {messages.length === 0 && (
            <div className="flex min-h-[200px] items-center justify-center pt-12 text-center">
              <div className="space-y-2">
                <p className="text-lg font-light text-gray-400">
                  Start speaking to begin your conversation
                </p>
                <p className="text-sm text-gray-600">
                  Your transcript will appear here
                </p>
              </div>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                "flex flex-col space-y-1 animate-in fade-in slide-in-from-bottom-2 duration-300",
                message.role === "user" ? "items-end" : "items-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-5 py-3",
                  message.role === "user"
                    ? "rounded-br-sm bg-blue-500/20 text-gray-100"
                    : "rounded-bl-sm bg-white/10 text-gray-100"
                )}
              >
                <p className="text-sm leading-relaxed md:text-base">
                  {message.content}
                </p>
              </div>
              <span className="px-2 text-[10px] text-gray-500">
                {formatTime(message.timestamp)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
