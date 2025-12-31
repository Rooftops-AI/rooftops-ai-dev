"use client"

import { FC, useRef, useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { Button } from "@/components/ui/button"
import { IconCopy, IconDownload, IconX } from "@tabler/icons-react"
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
}

export const ArtifactViewer: FC<ArtifactViewerProps> = ({
  content,
  title,
  isOpen,
  onClose,
  companyLogo,
  isGenerating = false
}) => {
  const contentRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  const handleCopy = () => {
    navigator.clipboard.writeText(content)
    toast.success("Copied to clipboard!")
  }

  const handleDownload = () => {
    const blob = new Blob([content], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${title.replace(/\s+/g, "-").toLowerCase()}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success("Downloaded!")
  }

  const handlePrint = () => {
    window.print()
  }

  if (!isOpen || !mounted) return null

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative h-[90vh] w-[90vw] max-w-[1200px] overflow-hidden rounded-lg bg-white shadow-2xl dark:bg-gray-900">
        {/* Header */}
        <div className="border-border flex items-center justify-between border-b bg-gray-50 px-6 py-4 dark:bg-gray-800">
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
              variant="outline"
              onClick={handlePrint}
              disabled={isGenerating}
            >
              <svg
                className="mr-2 size-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                />
              </svg>
              Print
            </Button>
            <Button size="sm" variant="ghost" onClick={onClose}>
              <IconX size={20} />
            </Button>
          </div>
        </div>

        {/* Document Content */}
        <div className="h-[calc(100%-73px)] overflow-y-auto bg-gray-100 p-4 dark:bg-gray-950">
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
        </div>

        {/* Print Styles */}
        <style jsx global>{`
          /* Screen styles - give document a page-like appearance */
          @media screen {
            .document-content {
              min-height: 11in;
            }
          }

          @media print {
            @page {
              size: letter;
              margin: 0.5in;
            }

            /* Hide everything except the document content */
            body * {
              visibility: hidden;
            }
            .document-content,
            .document-content * {
              visibility: visible;
            }

            /* Make document content flow naturally across pages */
            .document-content {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              max-width: 100%;
              height: auto !important;
              min-height: 0 !important;
              max-height: none !important;
              padding: 0 !important;
              margin: 0 !important;
              background: white !important;
              box-shadow: none !important;
              overflow: visible !important;
            }

            /* Prevent page breaks in the middle of certain elements */
            h1,
            h2,
            h3,
            h4,
            h5,
            h6 {
              page-break-after: avoid;
              page-break-inside: avoid;
            }

            table,
            ul,
            ol {
              page-break-inside: avoid;
            }

            p {
              orphans: 3;
              widows: 3;
            }

            /* Allow content to continue to next page */
            .prose {
              height: auto !important;
              max-height: none !important;
            }
          }
        `}</style>
      </div>
    </div>,
    document.body
  )
}
