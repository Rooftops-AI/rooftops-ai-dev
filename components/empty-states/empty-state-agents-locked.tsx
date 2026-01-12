"use client"

import { Button } from "@/components/ui/button"
import { IconLock, IconCrown, IconSparkles } from "@tabler/icons-react"
import { useRouter } from "next/navigation"

export function EmptyStateAgentsLocked() {
  const router = useRouter()

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
        <IconLock className="size-10 text-amber-600 dark:text-amber-400" />
      </div>

      <h2 className="mb-3 text-2xl font-bold">Unlock AI Agents</h2>

      <p className="text-muted-foreground mb-8 max-w-md text-lg">
        Get access to our powerful AI agent library with specialized tools for
        document generation, cost estimation, and property analysis.
      </p>

      <div className="mb-8 space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <IconSparkles className="size-5 text-green-600 dark:text-green-400" />
          </div>
          <span className="text-sm">Professional document generation</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <IconSparkles className="size-5 text-green-600 dark:text-green-400" />
          </div>
          <span className="text-sm">Automated cost estimates</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <IconSparkles className="size-5 text-green-600 dark:text-green-400" />
          </div>
          <span className="text-sm">Advanced property insights</span>
        </div>
      </div>

      <Button
        onClick={() => router.push("/pricing")}
        size="lg"
        className="bg-gradient-to-r from-amber-500 to-orange-500 px-8 hover:from-amber-600 hover:to-orange-600"
      >
        <IconCrown className="mr-2 size-5" />
        Upgrade to Premium
      </Button>

      <p className="text-muted-foreground mt-6 text-sm">
        Available on Premium ($29/mo) and Business ($99/mo) plans
      </p>
    </div>
  )
}
