import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const json = await req.json()
  const { text, fileId, embeddingsProvider, fileExtension } = json as {
    text: string
    fileId: string
    embeddingsProvider: "openai" | "local"
    fileExtension: string
  }

  try {
    // Store the file text as a simple chunk for retrieval (without embeddings)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get the file to find the user_id
    const { data: fileData } = await supabaseAdmin
      .from("files")
      .select("user_id")
      .eq("id", fileId)
      .single()

    if (fileData && text) {
      // Store the file content as chunks (simplified - just split by paragraphs)
      const chunks = text
        .split(/\n\n+/)
        .filter(chunk => chunk.trim().length > 0)
        .map(chunk => ({
          file_id: fileId,
          user_id: fileData.user_id,
          content: chunk.trim(),
          tokens: Math.ceil(chunk.length / 4) // Rough estimate
        }))

      if (chunks.length > 0) {
        await supabaseAdmin.from("file_items").insert(chunks)

        const totalTokens = chunks.reduce((acc, item) => acc + item.tokens, 0)
        await supabaseAdmin
          .from("files")
          .update({ tokens: totalTokens })
          .eq("id", fileId)
      }
    }

    console.log(`Processed ${fileExtension} file: ${fileId}`)

    return new NextResponse(
      JSON.stringify({
        message: "File processed successfully",
        fileId
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    )
  } catch (error: any) {
    console.error("Error processing docx:", error)
    const errorMessage = error.message || "An unexpected error occurred"
    return new Response(JSON.stringify({ message: errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    })
  }
}
