import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import { DocumentProcessor } from "@/lib/document-processor"

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file_id = formData.get("file_id") as string
    const embeddingsProvider = formData.get("embeddingsProvider") as string

    console.log(
      `Processing file: ${file_id} with embeddings provider: ${embeddingsProvider}`
    )

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get the file record to find out the file type and path
    const { data: fileData, error: fileError } = await supabaseAdmin
      .from("files")
      .select("*")
      .eq("id", file_id)
      .single()

    if (fileError || !fileData) {
      throw new Error("File not found")
    }

    // Download the file from storage
    const { data: fileBlob, error: downloadError } = await supabaseAdmin.storage
      .from("files")
      .download(fileData.file_path)

    if (downloadError || !fileBlob) {
      throw new Error("Failed to download file from storage")
    }

    console.log(
      `Downloaded file: ${fileData.name} (${fileData.type}), size: ${fileBlob.size} bytes`
    )

    // Use the enhanced document processor
    const processor = new DocumentProcessor()

    try {
      const processedDoc = await processor.processDocument(
        fileBlob,
        fileData.name,
        fileData.type
      )

      console.log(
        `Processed document with ${processedDoc.chunks.length} chunks using ${processedDoc.metadata.processingMethod}`
      )

      // Store the chunks in the database
      if (processedDoc.chunks.length > 0) {
        const chunksToInsert = processedDoc.chunks.map(chunk => ({
          file_id: file_id,
          user_id: fileData.user_id,
          content: chunk.content,
          tokens: chunk.tokens
        }))

        const { error: insertError } = await supabaseAdmin
          .from("file_items")
          .insert(chunksToInsert)

        if (insertError) {
          console.error("Error inserting file chunks:", insertError)
          throw insertError
        }

        // Update file with token count and metadata
        const totalTokens = processedDoc.chunks.reduce(
          (acc, chunk) => acc + chunk.tokens,
          0
        )
        await supabaseAdmin
          .from("files")
          .update({
            tokens: totalTokens
          })
          .eq("id", file_id)

        console.log(`Successfully stored ${chunksToInsert.length} chunks`)
      }

      return new NextResponse(
        JSON.stringify({
          message: "File processed successfully",
          fileId: file_id,
          chunks: processedDoc.chunks.length,
          tokens: processedDoc.chunks.reduce(
            (acc, chunk) => acc + chunk.tokens,
            0
          ),
          processingMethod: processedDoc.metadata.processingMethod
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" }
        }
      )
    } catch (processingError) {
      console.error("Error processing document:", processingError)
      return new NextResponse(
        JSON.stringify({
          message: "Failed to process document",
          fileId: file_id,
          error:
            processingError instanceof Error
              ? processingError.message
              : "Unknown error"
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      )
    }
  } catch (error: any) {
    console.error(`Error in retrieval/process: ${error.stack}`)
    const errorMessage = error?.message || "An unexpected error occurred"
    return new Response(JSON.stringify({ message: errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    })
  }
}
