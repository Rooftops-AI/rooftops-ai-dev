"use client"

import { FC } from "react"
import { IconFileText, IconExternalLink } from "@tabler/icons-react"
import { Card } from "../ui/card"
import { useCanvas } from "@/context/CanvasContext"

interface ArtifactCompleteCardProps {
  messageContent: string
}

/**
 * Shows a clickable card when an artifact has been completed
 * Allows users to reopen the canvas to view the artifact
 */
export const ArtifactCompleteCard: FC<ArtifactCompleteCardProps> = ({
  messageContent
}) => {
  const { openCanvas, artifacts, setCurrentArtifact } = useCanvas()

  // Check if we have a complete artifact (has both opening and closing tags)
  const hasOpeningTag = messageContent.includes("<artifact")
  const hasClosingTag = messageContent.includes("</artifact>")
  const isComplete = hasOpeningTag && hasClosingTag

  if (!isComplete) return null

  // Try to extract the title from the artifact tag
  const titleMatch = messageContent.match(/title="([^"]+)"/)
  const title = titleMatch ? titleMatch[1] : "Untitled Document"

  // Extract the type
  const typeMatch = messageContent.match(/type="([^"]+)"/)
  const type = typeMatch ? typeMatch[1] : "document"

  const handleOpenArtifact = () => {
    // Find the most recent artifact that matches this title
    const matchingArtifact = artifacts
      .slice()
      .reverse()
      .find(a => a.title === title)

    if (matchingArtifact) {
      setCurrentArtifact(matchingArtifact)
      openCanvas()
    }
  }

  return (
    <Card
      className="mt-4 cursor-pointer border-green-200 bg-green-50 p-4 transition-all hover:border-green-300 hover:shadow-md dark:border-green-800 dark:bg-green-950 dark:hover:border-green-700"
      onClick={handleOpenArtifact}
    >
      <div className="flex items-start gap-3">
        <div className="mt-1">
          <IconFileText
            className="text-green-600 dark:text-green-400"
            size={24}
          />
        </div>
        <div className="flex-1">
          <div className="mb-1 flex items-center gap-2">
            <h3 className="font-semibold text-green-900 dark:text-green-100">
              Document Created
            </h3>
            <IconExternalLink
              className="text-green-600 dark:text-green-400"
              size={16}
            />
          </div>
          <p className="text-sm text-green-700 dark:text-green-300">{title}</p>
          <p className="mt-1 text-xs text-green-600 dark:text-green-400">
            Click to open in canvas
          </p>
        </div>
      </div>
    </Card>
  )
}
