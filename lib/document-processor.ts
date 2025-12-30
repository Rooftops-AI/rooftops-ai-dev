/**
 * Enhanced Document Processor
 * Supports multiple file types with intelligent parsing and chunking
 */

import pdf from "pdf-parse"
import mammoth from "mammoth"
import PDFParser from "pdf2json"

export interface ProcessedDocument {
  content: string
  chunks: DocumentChunk[]
  metadata: {
    fileType: string
    pageCount?: number
    wordCount: number
    processingMethod: string
  }
}

export interface DocumentChunk {
  content: string
  tokens: number
  metadata: {
    chunkIndex: number
    startPosition: number
    endPosition: number
  }
}

export class DocumentProcessor {
  /**
   * Process a document file and return structured content with chunks
   */
  async processDocument(
    fileBlob: Blob,
    fileName: string,
    fileType: string
  ): Promise<ProcessedDocument> {
    console.log(`Processing document: ${fileName} (${fileType})`)

    try {
      // Process based on file type
      return await this.processWithFallback(fileBlob, fileType)
    } catch (error) {
      console.error("Error processing document:", error)
      throw error
    }
  }

  /**
   * Fallback processing using basic libraries
   */
  private async processWithFallback(
    fileBlob: Blob,
    fileType: string
  ): Promise<ProcessedDocument> {
    const type = fileType.toLowerCase()

    if (type.includes("pdf")) {
      return await this.processPDF(fileBlob)
    } else if (type.includes("docx") || type.includes("doc")) {
      return await this.processDOCX(fileBlob)
    } else if (
      type.includes("txt") ||
      type.includes("text") ||
      type.includes("markdown") ||
      type.includes("md")
    ) {
      return await this.processText(fileBlob, type)
    } else if (type.includes("csv")) {
      return await this.processCSV(fileBlob)
    } else if (type.includes("json")) {
      return await this.processJSON(fileBlob)
    }

    throw new Error(`Unsupported file type: ${fileType}`)
  }

  /**
   * Process PDF files
   */
  private async processPDF(fileBlob: Blob): Promise<ProcessedDocument> {
    const arrayBuffer = await fileBlob.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Try pdf-parse first
    const pdfData = await pdf(buffer)

    console.log(`PDF extracted text length: ${pdfData.text.length}`)
    console.log(`PDF first 200 chars: ${pdfData.text.substring(0, 200)}`)
    console.log(`PDF pages: ${pdfData.numpages}`)

    let extractedText = pdfData.text
    let method = "pdf-parse"

    // If pdf-parse extracted minimal text, try pdf2json
    if (pdfData.text.trim().length < 100) {
      console.log("PDF text too short, trying pdf2json...")
      try {
        const pdf2jsonText = await this.extractWithPDF2JSON(buffer)
        if (pdf2jsonText.length > pdfData.text.length) {
          console.log(
            `pdf2json extracted more text: ${pdf2jsonText.length} chars`
          )
          extractedText = pdf2jsonText
          method = "pdf2json"
        }
      } catch (error) {
        console.error("pdf2json failed:", error)
      }
    }

    const chunks = this.createSemanticChunks(extractedText)

    return {
      content: extractedText,
      chunks,
      metadata: {
        fileType: "pdf",
        pageCount: pdfData.numpages,
        wordCount: extractedText.split(/\s+/).length,
        processingMethod: method
      }
    }
  }

  private async extractWithPDF2JSON(buffer: Buffer): Promise<string> {
    return new Promise((resolve, reject) => {
      const pdfParser = new PDFParser()

      pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
        try {
          let text = ""
          if (pdfData.Pages) {
            for (const page of pdfData.Pages) {
              if (page.Texts) {
                for (const textItem of page.Texts) {
                  if (textItem.R) {
                    for (const run of textItem.R) {
                      if (run.T) {
                        text += decodeURIComponent(run.T) + " "
                      }
                    }
                  }
                }
                text += "\n"
              }
            }
          }
          resolve(text)
        } catch (error) {
          reject(error)
        }
      })

      pdfParser.on("pdfParser_dataError", (error: Error) => {
        reject(error)
      })

      pdfParser.parseBuffer(buffer)
    })
  }

  /**
   * Process DOCX files
   */
  private async processDOCX(fileBlob: Blob): Promise<ProcessedDocument> {
    const arrayBuffer = await fileBlob.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const result = await mammoth.extractRawText({ buffer })

    const chunks = this.createSemanticChunks(result.value)

    return {
      content: result.value,
      chunks,
      metadata: {
        fileType: "docx",
        wordCount: result.value.split(/\s+/).length,
        processingMethod: "mammoth"
      }
    }
  }

  /**
   * Process text files
   */
  private async processText(
    fileBlob: Blob,
    fileType: string
  ): Promise<ProcessedDocument> {
    const text = await fileBlob.text()
    const chunks = this.createSemanticChunks(text)

    return {
      content: text,
      chunks,
      metadata: {
        fileType,
        wordCount: text.split(/\s+/).length,
        processingMethod: "text"
      }
    }
  }

  /**
   * Process CSV files
   */
  private async processCSV(fileBlob: Blob): Promise<ProcessedDocument> {
    const text = await fileBlob.text()

    // Convert CSV to readable format
    const lines = text.split("\n")
    const formattedContent = lines
      .map((line, index) => {
        if (index === 0) return `Headers: ${line}`
        return `Row ${index}: ${line}`
      })
      .join("\n")

    const chunks = this.createSemanticChunks(formattedContent)

    return {
      content: formattedContent,
      chunks,
      metadata: {
        fileType: "csv",
        wordCount: formattedContent.split(/\s+/).length,
        processingMethod: "csv-parser"
      }
    }
  }

  /**
   * Process JSON files
   */
  private async processJSON(fileBlob: Blob): Promise<ProcessedDocument> {
    const text = await fileBlob.text()
    const jsonData = JSON.parse(text)

    // Convert JSON to readable format
    const formattedContent = JSON.stringify(jsonData, null, 2)
    const chunks = this.createSemanticChunks(formattedContent)

    return {
      content: formattedContent,
      chunks,
      metadata: {
        fileType: "json",
        wordCount: formattedContent.split(/\s+/).length,
        processingMethod: "json-parser"
      }
    }
  }

  /**
   * Create semantic chunks with overlap for better context preservation
   */
  private createSemanticChunks(
    content: string,
    chunkSize: number = 1000,
    overlap: number = 200
  ): DocumentChunk[] {
    const chunks: DocumentChunk[] = []

    // Split by paragraphs first
    const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0)

    let currentChunk = ""
    let currentTokens = 0
    let chunkIndex = 0
    let startPosition = 0

    for (const paragraph of paragraphs) {
      const paragraphTokens = this.estimateTokens(paragraph)

      // If adding this paragraph would exceed chunk size, save current chunk
      if (
        currentTokens + paragraphTokens > chunkSize &&
        currentChunk.length > 0
      ) {
        chunks.push({
          content: currentChunk.trim(),
          tokens: currentTokens,
          metadata: {
            chunkIndex: chunkIndex++,
            startPosition,
            endPosition: startPosition + currentChunk.length
          }
        })

        // Start new chunk with overlap (last ~200 tokens of previous chunk)
        const overlapText = this.getLastNTokens(currentChunk, overlap)
        startPosition += currentChunk.length - overlapText.length
        currentChunk = overlapText + "\n\n" + paragraph
        currentTokens = this.estimateTokens(currentChunk)
      } else {
        currentChunk += (currentChunk ? "\n\n" : "") + paragraph
        currentTokens += paragraphTokens
      }
    }

    // Add the last chunk
    if (currentChunk.length > 0) {
      chunks.push({
        content: currentChunk.trim(),
        tokens: currentTokens,
        metadata: {
          chunkIndex: chunkIndex++,
          startPosition,
          endPosition: startPosition + currentChunk.length
        }
      })
    }

    console.log(
      `Created ${chunks.length} semantic chunks with ${overlap} token overlap`
    )
    return chunks
  }

  /**
   * Estimate token count (rough approximation)
   */
  private estimateTokens(text: string): number {
    // Rough estimate: ~4 characters per token
    return Math.ceil(text.length / 4)
  }

  /**
   * Get last N tokens from text
   */
  private getLastNTokens(text: string, n: number): string {
    const estimatedChars = n * 4
    return text.slice(-estimatedChars)
  }
}
