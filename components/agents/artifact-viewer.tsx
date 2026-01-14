"use client"

import { FC, useRef, useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  IconCopy,
  IconDownload,
  IconX,
  IconEdit,
  IconCheck,
  IconFileText,
  IconPrinter
} from "@tabler/icons-react"
import { toast } from "sonner"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

interface ArtifactViewerProps {
  content: string
  title: string
  isOpen: boolean
  onClose: () => void
  companyLogo?: string
  isGenerating?: boolean
  onContentChange?: (newContent: string) => void
}

export const ArtifactViewer: FC<ArtifactViewerProps> = ({
  content,
  title,
  isOpen,
  onClose,
  companyLogo,
  isGenerating = false,
  onContentChange
}) => {
  const contentRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState(content)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  useEffect(() => {
    setEditedContent(content)
  }, [content])

  const handleCopy = () => {
    navigator.clipboard.writeText(isEditing ? editedContent : content)
    toast.success("Copied to clipboard!")
  }

  const handleDownloadMarkdown = () => {
    const blob = new Blob([isEditing ? editedContent : content], {
      type: "text/markdown"
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${title.replace(/\s+/g, "-").toLowerCase()}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success("Markdown downloaded!")
  }

  const handleDownloadText = () => {
    const blob = new Blob([isEditing ? editedContent : content], {
      type: "text/plain"
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${title.replace(/\s+/g, "-").toLowerCase()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success("Text file downloaded!")
  }

  const handlePrint = () => {
    if (contentRef.current) {
      const printWindow = window.open("", "_blank")
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>${title}</title>
            <style>
              @page {
                size: letter;
                margin: 0.75in;
              }
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
                font-size: 11pt;
                line-height: 1.4;
                color: #000;
              }
              h1 {
                font-size: 18pt;
                font-weight: bold;
                text-align: center;
                margin-bottom: 12pt;
                text-transform: uppercase;
              }
              h2 {
                font-size: 11pt;
                font-weight: bold;
                margin-top: 16pt;
                margin-bottom: 8pt;
                text-transform: uppercase;
              }
              h3 {
                font-size: 10pt;
                font-weight: 600;
                margin-top: 12pt;
                margin-bottom: 6pt;
              }
              p {
                margin-bottom: 6pt;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin: 12pt 0;
              }
              th, td {
                border: 1px solid #ccc;
                padding: 6pt;
                text-align: left;
              }
              th {
                background-color: #f5f5f5;
                font-weight: bold;
              }
              ul, ol {
                margin: 6pt 0;
                padding-left: 24pt;
              }
              li {
                margin-bottom: 3pt;
              }
              hr {
                border: none;
                border-top: 1px solid #ccc;
                margin: 12pt 0;
              }
              img {
                max-height: 60px;
                margin-bottom: 12pt;
              }
            </style>
          </head>
          <body>
            ${companyLogo ? `<img src="${companyLogo}" alt="Company Logo" />` : ""}
            ${contentRef.current.innerHTML}
          </body>
          </html>
        `)
        printWindow.document.close()
        printWindow.focus()
        setTimeout(() => {
          printWindow.print()
          printWindow.close()
        }, 250)
      }
    }
  }

  const toggleEdit = () => {
    if (isEditing && onContentChange) {
      onContentChange(editedContent)
      toast.success("Changes saved!")
    }
    setIsEditing(!isEditing)
  }

  if (!isOpen || !mounted) return null

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative flex h-[90vh] w-[90vw] max-w-[1200px] flex-col overflow-hidden rounded-lg bg-white shadow-2xl dark:bg-gray-900">
        {/* Header */}
        <div className="border-border flex flex-shrink-0 items-center justify-between border-b bg-gray-50 px-6 py-4 dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold">{title}</h2>
            {isGenerating && (
              <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                <svg
                  className="size-4 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Generating...</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={isEditing ? "default" : "outline"}
              onClick={toggleEdit}
              disabled={isGenerating}
            >
              {isEditing ? (
                <>
                  <IconCheck className="mr-2 size-4" />
                  Save Changes
                </>
              ) : (
                <>
                  <IconEdit className="mr-2 size-4" />
                  Edit
                </>
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopy}
              disabled={isGenerating}
            >
              <IconCopy className="mr-2 size-4" />
              Copy
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleDownloadMarkdown}
              disabled={isGenerating}
            >
              <IconDownload className="mr-2 size-4" />
              .md
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleDownloadText}
              disabled={isGenerating}
            >
              <IconFileText className="mr-2 size-4" />
              .txt
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handlePrint}
              disabled={isGenerating}
            >
              <IconPrinter className="mr-2 size-4" />
              Print
            </Button>
            <Button size="sm" variant="ghost" onClick={onClose}>
              <IconX size={20} />
            </Button>
          </div>
        </div>

        {/* Document Content */}
        <div className="flex-1 overflow-y-auto bg-gray-100 p-4 dark:bg-gray-950">
          {isEditing ? (
            <div className="mx-auto h-full max-w-[850px]">
              <Textarea
                value={editedContent}
                onChange={e => setEditedContent(e.target.value)}
                className="h-full min-h-full resize-none bg-white p-8 font-mono text-sm dark:bg-gray-900"
                placeholder="Edit your content here..."
              />
            </div>
          ) : (
            <div
              ref={contentRef}
              className="document-content mx-auto max-w-[850px] bg-white p-8 shadow-lg dark:bg-gray-900"
              style={{
                fontFamily:
                  "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
                fontSize: "13px",
                lineHeight: "1.4"
              }}
            >
              {/* Company Logo */}
              {companyLogo && (
                <div className="mb-4">
                  <img
                    src={companyLogo}
                    alt="Company Logo"
                    className="h-12 w-auto"
                  />
                </div>
              )}

              {/* Rendered Content */}
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ children }) => (
                      <h1 className="mb-2 text-center text-xl font-bold uppercase tracking-wide text-gray-900 dark:text-gray-100">
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="mb-1 mt-3 text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="mb-1 mt-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
                        {children}
                      </h3>
                    ),
                    p: ({ children }) => (
                      <p className="mb-1 text-xs leading-snug text-gray-700 dark:text-gray-300">
                        {children}
                      </p>
                    ),
                    ul: ({ children }) => (
                      <ul className="mb-2 ml-4 list-disc space-y-0.5 text-xs text-gray-700 dark:text-gray-300">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="mb-2 ml-4 list-decimal space-y-0.5 text-xs text-gray-700 dark:text-gray-300">
                        {children}
                      </ol>
                    ),
                    li: ({ children }) => (
                      <li className="leading-snug">{children}</li>
                    ),
                    table: ({ children }) => (
                      <div className="my-2 overflow-x-auto">
                        <table className="min-w-full border-collapse text-xs">
                          {children}
                        </table>
                      </div>
                    ),
                    thead: ({ children }) => (
                      <thead className="bg-gray-100 dark:bg-gray-800">
                        {children}
                      </thead>
                    ),
                    tbody: ({ children }) => <tbody>{children}</tbody>,
                    tr: ({ children }) => (
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        {children}
                      </tr>
                    ),
                    th: ({ children }) => (
                      <th className="px-3 py-1 text-left font-semibold text-gray-700 dark:text-gray-300">
                        {children}
                      </th>
                    ),
                    td: ({ children }) => (
                      <td className="px-3 py-1 text-gray-700 dark:text-gray-300">
                        {children}
                      </td>
                    ),
                    hr: () => (
                      <hr className="my-2 border-t border-gray-300 dark:border-gray-700" />
                    ),
                    strong: ({ children }) => (
                      <strong className="font-bold text-gray-900 dark:text-gray-100">
                        {children}
                      </strong>
                    ),
                    em: ({ children }) => (
                      <em className="italic text-gray-600 dark:text-gray-400">
                        {children}
                      </em>
                    )
                  }}
                >
                  {content}
                </ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}
