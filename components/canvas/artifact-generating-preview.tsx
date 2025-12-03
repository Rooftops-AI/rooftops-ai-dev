"use client"

import { FC } from "react"
import { IconFileText, IconSparkles } from "@tabler/icons-react"
import { Card } from "../ui/card"

interface ArtifactGeneratingPreviewProps {
  messageContent: string
}

/**
 * Shows a preview card when an artifact is being generated (has opening tag but not closing tag)
 * Similar to how ChatGPT and Claude show artifact previews during generation
 */
export const ArtifactGeneratingPreview: FC<ArtifactGeneratingPreviewProps> = ({
  messageContent
}) => {
  // Check if we have an opening artifact tag but not a closing tag (artifact being generated)
  const hasOpeningTag = messageContent.includes("<artifact")
  const hasClosingTag = messageContent.includes("</artifact>")
  const isGenerating = hasOpeningTag && !hasClosingTag

  if (!isGenerating) return null

  // Try to extract the title from the partial artifact tag
  const titleMatch = messageContent.match(/title="([^"]+)"/)
  const title = titleMatch ? titleMatch[1] : "Untitled Document"

  return (
    <Card className="mt-4 border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950">
      <div className="flex items-start gap-3">
        <div className="mt-1 animate-bounce">
          <IconFileText
            className="text-blue-600 dark:text-blue-400"
            size={24}
          />
        </div>
        <div className="flex-1">
          <div className="mb-1 flex items-center gap-2">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100">
              Creating Document
            </h3>
            <IconSparkles
              className="animate-spin text-blue-600 dark:text-blue-400"
              size={16}
              style={{ animationDuration: "2s" }}
            />
          </div>
          <p className="text-sm text-blue-700 dark:text-blue-300">{title}</p>
          <div className="mt-2 flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
            <div className="h-1 w-24 overflow-hidden rounded-full bg-blue-200 dark:bg-blue-900">
              <div className="animate-progress size-full bg-gradient-to-r from-blue-400 to-blue-600 dark:from-blue-500 dark:to-blue-700" />
            </div>
            <span className="animate-pulse">Generating...</span>
          </div>
        </div>
      </div>
      <style jsx>{`
        @keyframes progress {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-progress {
          animation: progress 2s ease-in-out infinite;
        }
      `}</style>
    </Card>
  )
}
