import { getServerProfile } from "@/lib/server/server-chat-helpers"
import { OpenAIStream, StreamingTextResponse } from "ai"
import { ServerRuntime } from "next"
import OpenAI from "openai"
import { GLOBAL_API_KEYS } from "@/lib/api-keys"
import { checkAgentAccess } from "@/lib/entitlements"

export const runtime: ServerRuntime = "edge"

export async function POST(request: Request) {
  try {
    const { prompt, companyLogo } = await request.json()

    if (!prompt) {
      return new Response(JSON.stringify({ error: "Prompt is required" }), {
        status: 400
      })
    }

    const profile = await getServerProfile()

    // Check agent access (Premium and Business only)
    const hasAccess = await checkAgentAccess(profile.user_id)
    if (!hasAccess) {
      return new Response(
        JSON.stringify({
          error: "PREMIUM_REQUIRED",
          message: "Agents are available on Premium and Business plans",
          upgradeRequired: true
        }),
        { status: 403 }
      )
    }

    // Use global API key
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

    // Build messages array
    const messages: any[] = [
      {
        role: "system",
        content:
          "You are a professional assistant helping roofing professionals create high-quality business documents. Generate well-formatted, professional content based on the provided details. Use ONLY clean markdown formatting - no HTML tags, no divs, no inline styles, no image tags. Output pure markdown text that will be beautifully rendered."
      },
      {
        role: "user",
        content: prompt
      }
    ]

    // Create streaming request
    const response = await openai.chat.completions.create({
      model: "gpt-5.2-2025-12-11",
      messages,
      temperature: 0.7,
      max_completion_tokens: 4096,
      stream: true
    })

    const stream = OpenAIStream(response as any)

    // Note: Agent access is tier-based, not usage-based.
    // Access is checked above via checkAgentAccess()

    return new StreamingTextResponse(stream)
  } catch (error: any) {
    console.error("[Agent Generate] Error:", error)

    let errorMessage = error.message || "An unexpected error occurred"
    const errorCode = error.status || 500

    if (errorMessage.toLowerCase().includes("api key not found")) {
      errorMessage = "OpenAI API Key not found. Please contact support."
    } else if (errorMessage.toLowerCase().includes("incorrect api key")) {
      errorMessage = "OpenAI API Key is incorrect. Please contact support."
    }

    return new Response(JSON.stringify({ message: errorMessage }), {
      status: errorCode
    })
  }
}
