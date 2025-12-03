import { getServerProfile } from "@/lib/server/server-chat-helpers"
import { CHAT_SETTING_LIMITS } from "@/lib/chat-setting-limits"
import { ChatSettings, LLMID } from "@/types"
import { OpenAIStream, StreamingTextResponse } from "ai"
import { ServerRuntime } from "next"
import OpenAI from "openai"
import { ChatCompletionCreateParamsBase } from "openai/resources/chat/completions.mjs"
import { createClient } from "@supabase/supabase-js"
import { ROOFING_EXPERT_SYSTEM_PROMPT } from "@/lib/system-prompts"
import { GLOBAL_API_KEYS } from "@/lib/api-keys"
import {
  requireFeatureAccess,
  trackAndCheckFeature
} from "@/lib/subscription-helpers"

export const runtime: ServerRuntime = "edge"

// Add GET handler to verify routing works
export async function GET(request: Request) {
  console.log("[OpenAI Route] GET handler called - method not allowed")
  return new Response(
    JSON.stringify({ error: "Method GET not allowed. Use POST." }),
    { status: 405, headers: { "Content-Type": "application/json" } }
  )
}

export async function POST(request: Request) {
  console.log("[OpenAI Route] POST handler called", {
    url: request.url,
    method: request.method,
    headers: Object.fromEntries(request.headers.entries())
  })

  let json: any
  let chatSettings: ChatSettings
  let messages: any[]
  let workspaceId: string | undefined

  try {
    json = await request.json()
    chatSettings = json.chatSettings
    messages = json.messages
    workspaceId = json.workspaceId

    console.log("[OpenAI Route] Request parsed successfully", {
      model: chatSettings?.model,
      messageCount: messages?.length,
      workspaceId
    })
  } catch (parseError: any) {
    console.error("[OpenAI Route] Failed to parse request", parseError)
    return new Response(
      JSON.stringify({
        error: "Invalid request body",
        details: parseError.message
      }),
      { status: 400 }
    )
  }

  try {
    const profile = await getServerProfile()

    // Check subscription limits before processing
    const accessCheck = await requireFeatureAccess(
      profile.user_id,
      "chat_messages"
    )
    if (!accessCheck.allowed) {
      return new Response(
        JSON.stringify({
          error: accessCheck.error,
          limit: accessCheck.limit,
          currentUsage: accessCheck.currentUsage,
          upgradeRequired: true
        }),
        { status: 402 } // 402 Payment Required
      )
    }

    // Use global API keys instead of user-provided keys
    if (!GLOBAL_API_KEYS.openai) {
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured" }),
        { status: 500 }
      )
    }

    const openai = new OpenAI({
      apiKey: GLOBAL_API_KEYS.openai,
      organization: GLOBAL_API_KEYS.openai_org
    })

    // RAG: Search documents for relevant context
    let documentContext = ""
    let sourceDocs: any[] = []

    try {
      // Get the user's latest message
      const userMessages = messages.filter((m: any) => m.role === "user")
      const latestUserMessage = userMessages[userMessages.length - 1]
      const userQuery =
        typeof latestUserMessage?.content === "string"
          ? latestUserMessage.content
          : latestUserMessage?.content?.[0]?.text || ""

      console.log("OpenAI RAG - Query:", userQuery?.substring(0, 100))
      console.log("OpenAI RAG - WorkspaceId:", workspaceId)
      console.log(
        "OpenAI RAG - Web search enabled:",
        profile.web_search_enabled
      )

      // Check if user has web search enabled (default: true)
      const shouldUseWebSearch = profile.web_search_enabled !== false

      if (userQuery && workspaceId && shouldUseWebSearch) {
        // Skip document RAG search and go straight to web search
        let sourceCounter = 0

        // Search the web with Brave directly (no internal API call)
        try {
          const braveApiKey =
            process.env.BRAVE_SEARCH_API_KEY || process.env.BRAVE_AI_API_KEY

          if (braveApiKey) {
            console.log("OpenAI RAG - Starting Brave search")
            const braveStartTime = Date.now()

            const braveResponse = await fetch(
              `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(userQuery)}&count=10`,
              {
                headers: {
                  Accept: "application/json",
                  "X-Subscription-Token": braveApiKey
                }
              }
            )

            const braveElapsed = Date.now() - braveStartTime
            console.log(
              `OpenAI RAG - Brave response received after ${braveElapsed}ms, status: ${braveResponse.status}`
            )

            if (braveResponse.ok) {
              const braveData = await braveResponse.json()
              const webResults = braveData.web?.results || []

              if (webResults.length > 0) {
                console.log(
                  "OpenAI RAG - Found",
                  webResults.length,
                  "web results"
                )

                if (!documentContext) {
                  documentContext = "\n\n--- RELEVANT INFORMATION ---\n"
                }

                documentContext += "\n--- WEB SEARCH RESULTS ---\n"

                webResults.forEach((result: any) => {
                  sourceCounter++
                  const snippet = result.description || ""
                  documentContext += `[Source ${sourceCounter}] (Web Search: ${result.title})\nURL: ${result.url}\n${snippet}\n\n`

                  sourceDocs.push({
                    id: `web-${sourceCounter}`,
                    sourceNumber: sourceCounter,
                    title: result.title,
                    fileName: result.url,
                    isGlobal: false,
                    documentType: "Web Search",
                    chunkContent: `${result.title}\n\n${snippet}\n\nSource: ${result.url}`,
                    preview: snippet.substring(0, 50).trim()
                  })
                })
              }
            } else {
              const errorText = await braveResponse.text()
              console.error("OpenAI RAG - Brave API error:", errorText)
            }
          } else {
            console.log("OpenAI RAG - Brave API key not configured")
          }
        } catch (braveError: any) {
          console.error("OpenAI RAG - Brave search error:", {
            name: braveError.name,
            message: braveError.message,
            cause: braveError.cause
          })
          // Continue without Brave results - don't let this block the response
        }

        if (documentContext) {
          documentContext += "--- END INFORMATION ---\n"
          documentContext +=
            "When answering, cite specific sources using the format [Source X] where applicable.\n\n"
        }
      }
    } catch (ragError) {
      console.error("RAG search error:", ragError)
      // Continue without RAG if it fails
    }

    // Check if model has temperature constraints
    const modelLimits = CHAT_SETTING_LIMITS[chatSettings.model as LLMID]
    let temperature = chatSettings.temperature

    // If model only supports a single temperature value (MIN === MAX), use that value
    if (
      modelLimits &&
      modelLimits.MIN_TEMPERATURE === modelLimits.MAX_TEMPERATURE
    ) {
      temperature = modelLimits.MIN_TEMPERATURE
    }

    // Prepend document context and roofing expert prompt to system message
    // BUT skip this for vision requests (messages with images)
    const modifiedMessages = [...messages]

    // Check if this is a vision request (has image_url content)
    const hasImages = modifiedMessages.some((msg: any) => {
      if (Array.isArray(msg.content)) {
        return msg.content.some((item: any) => item.type === "image_url")
      }
      return false
    })

    if (modifiedMessages.length > 0 && !hasImages) {
      // Only add roofing expert prompt for non-vision requests
      // Combine roofing expert prompt, document context, and original system message
      const systemContent =
        ROOFING_EXPERT_SYSTEM_PROMPT +
        "\n\n" +
        (documentContext || "") +
        modifiedMessages[0].content
      modifiedMessages[0] = {
        ...modifiedMessages[0],
        content: systemContent
      }
    } else if (hasImages && documentContext) {
      // For vision requests, only add document context if available (no roofing prompt)
      const firstSystemMsg = modifiedMessages.find(
        (m: any) => m.role === "system"
      )
      if (firstSystemMsg) {
        firstSystemMsg.content =
          documentContext + "\n\n" + firstSystemMsg.content
      }
    }

    // Build request params, only including max_tokens for specific models
    const requestParams: any = {
      model: chatSettings.model as ChatCompletionCreateParamsBase["model"],
      messages: modifiedMessages as ChatCompletionCreateParamsBase["messages"],
      temperature: temperature,
      stream: true
    }

    // Only set max_tokens for models that need it (vision models)
    if (
      chatSettings.model === "gpt-4-vision-preview" ||
      chatSettings.model === "gpt-4o"
    ) {
      requestParams.max_tokens = 4096
    }

    const response = await openai.chat.completions.create(requestParams)

    const stream = OpenAIStream(response as any)

    // Track usage after successful API call (don't await to not block response)
    trackAndCheckFeature(profile.user_id, "chat_messages", 1).catch(err =>
      console.error("Failed to track usage:", err)
    )

    // If we have document sources, prepend metadata to the stream
    if (sourceDocs.length > 0) {
      const encoder = new TextEncoder()
      const metadataLine = `__DOCUMENTS__:${JSON.stringify(sourceDocs)}\n`

      const transformedStream = new ReadableStream({
        async start(controller) {
          // First, send the metadata
          controller.enqueue(encoder.encode(metadataLine))

          // Then pipe through the original stream
          const reader = stream.getReader()
          try {
            while (true) {
              const { done, value } = await reader.read()
              if (done) break
              controller.enqueue(value)
            }
          } finally {
            reader.releaseLock()
            controller.close()
          }
        }
      })

      return new StreamingTextResponse(transformedStream)
    }

    return new StreamingTextResponse(stream)
  } catch (error: any) {
    console.error("[OpenAI Route] Error occurred:", {
      name: error.name,
      message: error.message,
      status: error.status,
      stack: error.stack?.split("\n").slice(0, 3)
    })

    let errorMessage = error.message || "An unexpected error occurred"
    const errorCode = error.status || 500

    if (errorMessage.toLowerCase().includes("api key not found")) {
      errorMessage =
        "OpenAI API Key not found. Please set it in your profile settings."
    } else if (errorMessage.toLowerCase().includes("incorrect api key")) {
      errorMessage =
        "OpenAI API Key is incorrect. Please fix it in your profile settings."
    }

    console.error("[OpenAI Route] Returning error response:", {
      status: errorCode,
      message: errorMessage
    })

    return new Response(JSON.stringify({ message: errorMessage }), {
      status: errorCode
    })
  }
}
