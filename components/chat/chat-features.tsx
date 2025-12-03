"use client"

import { useChatbotUI } from "@/context/context"
import { updateProfile } from "@/db/profile"
import { IconAdjustments, IconChevronDown } from "@tabler/icons-react"
import { FC, useState } from "react"
import { Button } from "../ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger
} from "../ui/dropdown-menu"
import { Label } from "../ui/label"
import { Switch } from "../ui/switch"

interface ChatFeaturesProps {}

export const ChatFeatures: FC<ChatFeaturesProps> = ({}) => {
  const { profile, setProfile } = useChatbotUI()
  const [isOpen, setIsOpen] = useState(false)
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

  const handleToggleExtendedThinking = async (enabled: boolean) => {
    if (!profile) return

    setIsUpdating(true)
    try {
      const updatedProfile = await updateProfile(profile.id, {
        extended_thinking_enabled: enabled
      })
      setProfile(updatedProfile)
    } catch (error) {
      console.error("Failed to update extended thinking setting:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  if (!profile) return null

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-accent size-10"
          disabled={isUpdating}
        >
          <IconAdjustments className="size-5" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-[320px] space-y-4 p-4"
        align="start"
        side="top"
      >
        <div className="space-y-4">
          <h3 className="text-sm font-semibold">Chat Features</h3>

          {/* Web Search Toggle */}
          <div className="flex items-center justify-between space-x-3">
            <div className="flex-1 space-y-0.5">
              <Label htmlFor="web-search" className="text-sm font-medium">
                Web Search
              </Label>
              <p className="text-muted-foreground text-xs">
                Use AI search for all queries
              </p>
            </div>
            <Switch
              id="web-search"
              checked={profile.web_search_enabled}
              onCheckedChange={handleToggleWebSearch}
              disabled={isUpdating}
            />
          </div>

          {/* Extended Thinking Toggle - Hidden for now */}
          {/* <div className="flex items-center justify-between space-x-3">
            <div className="flex-1 space-y-0.5">
              <Label
                htmlFor="extended-thinking"
                className="text-sm font-medium"
              >
                Extended Thinking
              </Label>
              <p className="text-muted-foreground text-xs">
                Enable deeper analysis mode
              </p>
            </div>
            <Switch
              id="extended-thinking"
              checked={profile.extended_thinking_enabled}
              onCheckedChange={handleToggleExtendedThinking}
              disabled={isUpdating}
            />
          </div> */}

          {/* Divider */}
          <div className="border-border border-t" />

          {/* Document Connectors Section */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Document Sources</h4>

            {/* Google Drive */}
            <div className="flex items-center justify-between">
              <div className="flex-1 space-y-0.5">
                <Label className="text-sm">Google Drive</Label>
                <p className="text-muted-foreground text-xs">
                  {profile.google_drive_connected
                    ? "Connected"
                    : "Not connected"}
                </p>
              </div>
              <Button variant="outline" size="sm" className="text-xs" disabled>
                {profile.google_drive_connected ? "Manage" : "Connect"}
              </Button>
            </div>

            {/* Dropbox */}
            <div className="flex items-center justify-between">
              <div className="flex-1 space-y-0.5">
                <Label className="text-sm">Dropbox</Label>
                <p className="text-muted-foreground text-xs">
                  {profile.dropbox_connected ? "Connected" : "Not connected"}
                </p>
              </div>
              <Button variant="outline" size="sm" className="text-xs" disabled>
                {profile.dropbox_connected ? "Manage" : "Connect"}
              </Button>
            </div>

            {/* OneDrive */}
            <div className="flex items-center justify-between">
              <div className="flex-1 space-y-0.5">
                <Label className="text-sm">OneDrive</Label>
                <p className="text-muted-foreground text-xs">
                  {profile.onedrive_connected ? "Connected" : "Not connected"}
                </p>
              </div>
              <Button variant="outline" size="sm" className="text-xs" disabled>
                {profile.onedrive_connected ? "Manage" : "Connect"}
              </Button>
            </div>
          </div>

          {/* Coming Soon Note */}
          <p className="text-muted-foreground text-center text-xs italic">
            Document connectors coming soon
          </p>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
