"use client"

import { FC, useState } from "react"
import { IconInfoCircle, IconX } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface DowngradeNoticeBannerProps {
  currentTier: string
  scheduledTier: string
  effectiveDate: string
  onCancelDowngrade: () => void
}

export const DowngradeNoticeBanner: FC<DowngradeNoticeBannerProps> = ({
  currentTier,
  scheduledTier,
  effectiveDate,
  onCancelDowngrade
}) => {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) {
    return null
  }

  const formattedDate = new Date(effectiveDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  })

  return (
    <div className="border-b border-orange-200 bg-orange-50 dark:border-orange-900/50 dark:bg-orange-900/20">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-3">
          <IconInfoCircle className="size-5 text-orange-600 dark:text-orange-400" />
          <div>
            <p className="font-medium text-orange-900 dark:text-orange-100">
              Downgrade Scheduled
            </p>
            <p className="text-sm text-orange-700 dark:text-orange-300">
              Your plan will change from {currentTier} to {scheduledTier} on{" "}
              {formattedDate}. You can cancel this change anytime before then.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={onCancelDowngrade}
            size="sm"
            variant="default"
            className="bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600"
          >
            Cancel Downgrade
          </Button>
          <button
            onClick={() => setDismissed(true)}
            className={cn(
              "text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300",
              "rounded p-1 transition-colors"
            )}
            aria-label="Dismiss"
          >
            <IconX className="size-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
