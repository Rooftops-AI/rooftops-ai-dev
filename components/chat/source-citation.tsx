"use client"

import { Badge } from "@/components/ui/badge"
import { FileText } from "lucide-react"

interface SourceCitationProps {
  sourceNumber: number
  messageContent: string
  sourceData?: any // Optional direct source data from metadata
}

export function SourceCitation({
  sourceNumber,
  messageContent,
  sourceData
}: SourceCitationProps) {
  // Extract document info from the message content
  // Look for pattern like "[Source 1] (Type: filename)" or "[Source 1] (Web Search: title)"
  const extractDocumentInfo = () => {
    // Try multiple patterns to match different formats
    const patterns = [
      // Pattern 1: [Source X] (Type: filename/title)
      new RegExp(
        `\\[Source ${sourceNumber}\\]\\s*\\([^:]+:\\s*([^)]+)\\)`,
        "i"
      ),
      // Pattern 2: Just filename after [Source X]
      new RegExp(
        `\\[Source ${sourceNumber}\\].*?([A-Za-z0-9_-]+\\.(?:pdf|txt|docx?))`,
        "i"
      )
    ]

    for (const pattern of patterns) {
      const match = messageContent.match(pattern)
      if (match && match[1]) {
        return match[1].trim()
      }
    }

    return null
  }

  // Truncate source name to 10 characters with ellipsis
  const getTruncatedName = () => {
    // Prefer sourceData if available
    if (sourceData) {
      const fullName =
        sourceData.title || sourceData.fileName || `Source ${sourceNumber}`
      if (fullName.length <= 10) {
        return fullName
      }
      return fullName.substring(0, 10) + "..."
    }

    // Fall back to extracting from message content
    const fullName = extractDocumentInfo()
    if (!fullName) return `Source ${sourceNumber}`

    if (fullName.length <= 10) {
      return fullName
    }

    return fullName.substring(0, 10) + "..."
  }

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    console.log("[SourceCitation] Click handler called", {
      sourceNumber,
      sourceData,
      fileName: sourceData?.fileName
    })

    // If sourceData has a URL (web search result), open it directly with UTM tracking
    if (sourceData && sourceData.fileName) {
      // Check if fileName is a URL (web search results store URL in fileName)
      if (sourceData.fileName.startsWith("http")) {
        const url = new URL(sourceData.fileName)
        url.searchParams.set("utm_source", "rooftopsai")
        url.searchParams.set("utm_medium", "chat")
        url.searchParams.set("utm_campaign", "source_citation")
        console.log("[SourceCitation] Opening URL:", url.toString())
        window.open(url.toString(), "_blank", "noopener,noreferrer")
        return
      }
    }

    // For document sources (not implemented yet), you could handle them here
    console.log("[SourceCitation] No URL found for source:", sourceNumber)
  }

  return (
    <Badge
      variant="outline"
      className="bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground border-muted-foreground/20 inline-flex cursor-pointer items-center gap-1 px-2 py-0.5 text-xs transition-colors"
      onClick={handleClick}
    >
      <FileText className="size-3" />
      {getTruncatedName()}
    </Badge>
  )
}
