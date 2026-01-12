"use client"

import { Button } from "@/components/ui/button"
import { IconMessageCircle, IconSparkles } from "@tabler/icons-react"

interface EmptyStateChatProps {
  onPromptClick?: (prompt: string) => void
}

const examplePrompts = [
  {
    title: "Property Analysis",
    prompt: "What are the key factors to look for when inspecting a roof?",
    icon: "🏠"
  },
  {
    title: "Cost Estimation",
    prompt: "How do I estimate the cost of a roof replacement?",
    icon: "💰"
  },
  {
    title: "Material Selection",
    prompt: "What are the pros and cons of different roofing materials?",
    icon: "🔨"
  },
  {
    title: "Solar Assessment",
    prompt: "How do I determine if a roof is suitable for solar panels?",
    icon: "☀️"
  }
]

export function EmptyStateChat({ onPromptClick }: EmptyStateChatProps) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
        <IconMessageCircle className="size-10 text-blue-600 dark:text-blue-400" />
      </div>

      <h2 className="mb-3 text-2xl font-bold">Ask Anything About Roofing</h2>

      <p className="text-muted-foreground mb-8 max-w-md text-lg">
        Get expert answers about property analysis, cost estimates, materials,
        and more. Try one of these examples:
      </p>

      <div className="mb-8 grid w-full max-w-2xl gap-3 sm:grid-cols-2">
        {examplePrompts.map((example, index) => (
          <button
            key={index}
            onClick={() => onPromptClick?.(example.prompt)}
            className="border-border hover:border-primary/50 hover:bg-accent group flex items-start gap-3 rounded-lg border p-4 text-left transition-colors"
          >
            <span className="text-2xl">{example.icon}</span>
            <div className="flex-1">
              <div className="group-hover:text-primary mb-1 font-semibold transition-colors">
                {example.title}
              </div>
              <div className="text-muted-foreground text-sm">
                {example.prompt}
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="text-muted-foreground flex items-center gap-2 text-sm">
        <IconSparkles className="size-4" />
        <span>Powered by advanced AI technology</span>
      </div>
    </div>
  )
}
