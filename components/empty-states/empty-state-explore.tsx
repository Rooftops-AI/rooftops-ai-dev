"use client"

import { Button } from "@/components/ui/button"
import { IconSparkles, IconSearch, IconMap } from "@tabler/icons-react"

interface EmptyStateExploreProps {
  onGetStarted?: () => void
}

export function EmptyStateExplore({ onGetStarted }: EmptyStateExploreProps) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
        <IconMap className="size-10 text-blue-600 dark:text-blue-400" />
      </div>

      <h2 className="mb-3 text-2xl font-bold">Analyze Your First Property</h2>

      <p className="text-muted-foreground mb-8 max-w-md text-lg">
        Search for any address to get a comprehensive property report with
        AI-powered insights about the roof, condition, and solar potential.
      </p>

      <div className="mb-8 space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <IconSparkles className="size-5 text-green-600 dark:text-green-400" />
          </div>
          <span className="text-sm">AI-powered roof analysis</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <IconSparkles className="size-5 text-green-600 dark:text-green-400" />
          </div>
          <span className="text-sm">Detailed condition assessment</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <IconSparkles className="size-5 text-green-600 dark:text-green-400" />
          </div>
          <span className="text-sm">Solar potential analysis</span>
        </div>
      </div>

      {onGetStarted && (
        <Button onClick={onGetStarted} size="lg" className="px-8">
          <IconSearch className="mr-2 size-5" />
          Search for an Address
        </Button>
      )}

      <p className="text-muted-foreground mt-6 text-sm">
        Try: &quot;123 Main St, San Francisco, CA&quot;
      </p>
    </div>
  )
}
