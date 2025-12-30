# Enhanced Document Processing

## Overview

The application now includes an enhanced document processing system that intelligently extracts and chunks content from various file types for better RAG (Retrieval-Augmented Generation) performance.

## Features

### Supported File Types

- **PDF** (`.pdf`) - With layout understanding and table preservation
- **Microsoft Word** (`.docx`, `.doc`) - Full text extraction
- **PowerPoint** (`.pptx`, `.ppt`) - Slide content extraction
- **Excel** (`.xlsx`, `.xls`) - Spreadsheet data
- **Text** (`.txt`, `.md`) - Plain and markdown text
- **CSV** (`.csv`) - Structured data
- **JSON** (`.json`) - Structured data

### Processing Methods

The system uses two processing methods in order of preference:

1. **LlamaParse** (Recommended) - For PDF, DOCX, PPT, XLS files
   - Preserves document structure (headings, tables, lists)
   - Better handling of complex layouts
   - OCR-capable for scanned documents
   - Extracts tables and charts accurately
   - Requires API key (free tier: 7,000 pages/month)

2. **Fallback Processors** - For all file types when LlamaParse is unavailable
   - `pdf-parse` for PDFs
   - `mammoth` for DOCX files
   - Native parsers for text, CSV, JSON

### Smart Chunking

Documents are intelligently chunked with:
- **Semantic boundaries** - Chunks respect paragraph breaks
- **Context overlap** - 200 tokens overlap between chunks
- **Optimal size** - ~1000 tokens per chunk (adjustable)
- **Metadata** - Each chunk includes position and index information

## Setup Instructions

### 1. Get LlamaParse API Key (Optional but Recommended)

1. Sign up at [LlamaCloud](https://cloud.llamaindex.ai/)
2. Navigate to API Keys section
3. Generate a new API key
4. Free tier includes 7,000 pages/month

### 2. Add Environment Variable

Add to your `.env.local` file:

```bash
# LlamaParse API Key (optional - falls back to basic processing)
LLAMA_CLOUD_API_KEY=llx-your-api-key-here
```

### 3. Restart Development Server

```bash
npm run dev
```

## How It Works

### File Upload Flow

1. User uploads a file in the chat interface
2. File is stored in Supabase storage
3. Processing API (`/api/retrieval/process`) is triggered
4. Document processor analyzes file type and chooses best method
5. Content is extracted and intelligently chunked
6. Chunks are stored in `file_items` table with embeddings
7. When user asks questions, relevant chunks are retrieved
8. Chunks are added to the LLM context for accurate answers

### Usage Example

```typescript
// The DocumentProcessor is used automatically
// when files are uploaded, but you can also use it directly:

import { DocumentProcessor } from "@/lib/document-processor"

const processor = new DocumentProcessor()
const result = await processor.processDocument(fileBlob, fileName, fileType)

console.log(`Extracted ${result.chunks.length} chunks`)
console.log(`Processing method: ${result.metadata.processingMethod}`)
```

## Benefits

### Without LlamaParse (Fallback Mode)
- ✅ Works immediately, no API key needed
- ✅ Handles basic text extraction
- ⚠️ May miss tables and complex layouts
- ⚠️ Cannot process scanned PDFs

### With LlamaParse (Recommended)
- ✅ Preserves document structure
- ✅ Accurate table extraction
- ✅ OCR for scanned documents
- ✅ Better handling of technical documents
- ✅ Improved context for LLM responses
- ✅ Free tier: 7,000 pages/month

## Troubleshooting

### Issue: Files not being processed

**Solution**: Check the server logs for processing errors:
```bash
# In terminal, watch for:
Processing file: <file_id> with embeddings provider: openai
Processed document with X chunks using llamaparse
```

### Issue: LlamaParse not working

**Possible causes**:
1. Invalid or missing API key
2. API quota exceeded
3. Unsupported file type

**Solution**: System automatically falls back to basic processing

### Issue: "Cannot read properties of undefined"

**Solution**: This was fixed by ensuring `handleRetrieval` always returns an array

## Performance Tips

1. **Enable retrieval** - Make sure the retrieval toggle is enabled when asking about uploaded files
2. **Use specific questions** - More specific questions get better chunk matches
3. **Upload supported formats** - PDFs and DOCX work best with LlamaParse
4. **Monitor API usage** - Check your LlamaCloud dashboard for usage stats

## API Reference

### DocumentProcessor Class

```typescript
class DocumentProcessor {
  async processDocument(
    fileBlob: Blob,
    fileName: string,
    fileType: string
  ): Promise<ProcessedDocument>
}

interface ProcessedDocument {
  content: string
  chunks: DocumentChunk[]
  metadata: {
    fileType: string
    pageCount?: number
    wordCount: number
    processingMethod: string
  }
}

interface DocumentChunk {
  content: string
  tokens: number
  metadata: {
    chunkIndex: number
    startPosition: number
    endPosition: number
  }
}
```

## Future Enhancements

Potential improvements:
- [ ] Image extraction from PDFs
- [ ] OCR for scanned documents without LlamaParse
- [ ] Custom chunking strategies per file type
- [ ] Document summarization
- [ ] Automatic metadata extraction
- [ ] Support for more file types (Pages, Keynote, etc.)

## Cost Considerations

### LlamaParse Pricing

- **Free Tier**: 7,000 pages/month
- **Pro**: $49/month for 100,000 pages
- **Enterprise**: Custom pricing

### Alternatives

If you need more capacity without cost:

1. **Self-hosted OCR** - Use Tesseract + PyMuPDF
2. **Azure Document Intelligence** - $1.50 per 1,000 pages
3. **AWS Textract** - $1.50 per 1,000 pages

## Support

For issues or questions:
1. Check server logs for detailed error messages
2. Verify environment variables are set correctly
3. Test with a simple text file first
4. Review the processing API logs in `/api/retrieval/process`
