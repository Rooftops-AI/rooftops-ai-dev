"use client"

import { useEffect, useRef } from "react"
import { useCanvas } from "@/context/CanvasContext"
import { extractArtifactFromResponse } from "@/lib/artifact-detector"

interface ArtifactMessageProcessorProps {
  messageContent: string
  messageId: string
  role: "user" | "assistant"
}

/**
 * Component that processes messages for artifacts and automatically creates them
 * Place this in the message display component
 */
export const ArtifactMessageProcessor: React.FC<
  ArtifactMessageProcessorProps
> = ({ messageContent, messageId, role }) => {
  const { addArtifact, openCanvas } = useCanvas()
  const processedRef = useRef(new Set<string>())

  useEffect(() => {
    // Only process assistant messages
    if (role !== "assistant") return

    // Don't process the same message twice
    if (processedRef.current.has(messageId)) return

    // Only process if we have a complete artifact (check for closing tag)
    // This prevents premature opening during streaming
    if (!messageContent.includes("</artifact>")) {
      console.log("Artifact incomplete - waiting for closing tag")
      return
    }

    // Try to extract artifact from message
    const artifact = extractArtifactFromResponse(messageContent)

    if (artifact) {
      console.log(
        "Complete artifact detected, creating and opening canvas:",
        artifact.title
      )

      // Mark as processed FIRST to prevent duplicate processing
      processedRef.current.add(messageId)

      // Create the artifact in canvas (doesn't open drawer)
      addArtifact({
        type: artifact.type,
        title: artifact.title,
        content: artifact.content
      })

      // Wait a tick to ensure artifact is created, then open
      setTimeout(() => {
        openCanvas()
      }, 100)
    }
  }, [messageContent, messageId, role, addArtifact, openCanvas])

  // This component doesn't render anything
  return null
}
