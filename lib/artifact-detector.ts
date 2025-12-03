/**
 * Detects if a user message is requesting an artifact/document to be created
 */
export function detectArtifactRequest(userMessage: string): {
  isArtifactRequest: boolean
  type?: "document" | "code" | "markdown"
  suggestedTitle?: string
} {
  const lowerMessage = userMessage.toLowerCase()

  // Document keywords
  const documentKeywords = [
    "create a document",
    "write a document",
    "generate a document",
    "make a document",
    "draft a document",
    "create an article",
    "write an article",
    "create a report",
    "write a report",
    "create a proposal",
    "write a proposal",
    "create a letter",
    "write a letter",
    "create an essay",
    "write an essay",
    "create a memo",
    "write a memo",
    "create a blog post",
    "write a blog post"
  ]

  // Code keywords
  const codeKeywords = [
    "write code",
    "create code",
    "generate code",
    "write a function",
    "create a function",
    "write a script",
    "create a script",
    "write a program",
    "create a program"
  ]

  // Markdown keywords
  const markdownKeywords = [
    "create markdown",
    "write markdown",
    "generate markdown",
    "create a readme",
    "write a readme"
  ]

  // Check for document request
  for (const keyword of documentKeywords) {
    if (lowerMessage.includes(keyword)) {
      return {
        isArtifactRequest: true,
        type: "document",
        suggestedTitle: extractTitle(userMessage) || "Untitled Document"
      }
    }
  }

  // Check for code request
  for (const keyword of codeKeywords) {
    if (lowerMessage.includes(keyword)) {
      return {
        isArtifactRequest: true,
        type: "code",
        suggestedTitle: extractTitle(userMessage) || "Code Snippet"
      }
    }
  }

  // Check for markdown request
  for (const keyword of markdownKeywords) {
    if (lowerMessage.includes(keyword)) {
      return {
        isArtifactRequest: true,
        type: "markdown",
        suggestedTitle: extractTitle(userMessage) || "Markdown Document"
      }
    }
  }

  return { isArtifactRequest: false }
}

/**
 * Extracts a potential title from the user's message
 */
function extractTitle(message: string): string | null {
  // Look for patterns like "about X", "on X", "titled X", etc.
  const patterns = [
    /(?:about|on|titled|called|named)\s+["']([^"']+)["']/i,
    /(?:about|on|titled|called|named)\s+([^\.,!?]+)/i
  ]

  for (const pattern of patterns) {
    const match = message.match(pattern)
    if (match && match[1]) {
      // Clean up and truncate title
      let title = match[1].trim()
      if (title.length > 60) {
        title = title.substring(0, 57) + "..."
      }
      return title
    }
  }

  return null
}

/**
 * Extracts artifact from AI response
 * Returns artifact details if found, null otherwise
 */
export function extractArtifactFromResponse(aiResponse: string): {
  content: string
  title: string
  type: "document" | "code" | "markdown"
  remainingText: string
} | null {
  // Look for <artifact> tags with attributes
  const artifactPattern =
    /<artifact\s+type="([^"]+)"\s+title="([^"]+)">([\s\S]*?)<\/artifact>/

  const match = aiResponse.match(artifactPattern)
  if (match) {
    const [fullMatch, type, title, content] = match

    // Remove the artifact from the response to get remaining text
    const remainingText = aiResponse.replace(fullMatch, "").trim()

    return {
      content: content.trim(),
      title: title.trim(),
      type: type as "document" | "code" | "markdown",
      remainingText
    }
  }

  return null
}

/**
 * Extracts artifact content from AI response (legacy function)
 * Looks for content between special markers or just returns the full response
 */
export function extractArtifactContent(aiResponse: string): string {
  const artifact = extractArtifactFromResponse(aiResponse)
  if (artifact) {
    return artifact.content
  }

  // Legacy patterns for backward compatibility
  const markerPatterns = [
    /```(?:html|markdown|md)?\s*\n([\s\S]*?)\n```/,
    /<document>([\s\S]*?)<\/document>/
  ]

  for (const pattern of markerPatterns) {
    const match = aiResponse.match(pattern)
    if (match && match[1]) {
      return match[1].trim()
    }
  }

  // If no markers found, return the full response
  return aiResponse
}
