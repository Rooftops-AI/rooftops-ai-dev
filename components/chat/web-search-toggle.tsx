"use client"

import { useChatbotUI } from "@/context/context"
import { updateProfile } from "@/db/profile"
import { IconWorld } from "@tabler/icons-react"
import { FC, useState } from "react"
import { Switch } from "../ui/switch"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "../ui/tooltip"

interface WebSearchToggleProps {
  className?: string
}

export const WebSearchToggle: FC<WebSearchToggleProps> = ({ className }) => {
  const { profile, setProfile } = useChatbotUI()
  const [isUpdating, setIsUpdating] = useState(false)

  const handleToggleWebSearch = async (enabled: boolean) => {
    if (!profile) return

    setIsUpdating(true)
    try {
      const updatedProfile = await updateProfile(profile.id, {
        web_search_enabled: enabled
      })
      setProfile(updatedProfile)
    } catch (error) {
      console.error("Failed to update web search setting:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  if (!profile) return null

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn("flex items-center gap-2", className)}>
            <IconWorld
              size={20}
              className={cn(
                "transition-colors",
                profile.web_search_enabled
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            />
            <Switch
              checked={profile.web_search_enabled}
              onCheckedChange={handleToggleWebSearch}
              disabled={isUpdating}
              className="scale-90"
            />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Search web</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
