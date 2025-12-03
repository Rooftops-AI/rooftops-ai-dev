"use client"

import { FC, useRef, useState } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription
} from "@/components/ui/sheet"
import { useCanvas } from "@/context/CanvasContext"
import { DocumentEditor } from "./document-editor"
import { Button } from "../ui/button"
import {
  IconDownload,
  IconCopy,
  IconFileTypePdf,
  IconFileTypeDocx,
  IconX,
  IconEdit,
  IconCheck,
  IconMaximize,
  IconMinimize
} from "@tabler/icons-react"
import { toast } from "sonner"
import { exportToPDF, exportToWord, copyToClipboard } from "@/lib/canvas-export"
import { cn } from "@/lib/utils"
import { Separator } from "../ui/separator"

export const CanvasDrawer: FC = () => {
  const { isCanvasOpen, closeCanvas, currentArtifact, updateArtifact } =
    useCanvas()
  const [isEditing, setIsEditing] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  if (!currentArtifact) return null

  const handleContentChange = (newContent: string) => {
    updateArtifact(currentArtifact.id, { content: newContent })
  }

  const handleExportPDF = async () => {
    if (!contentRef.current) return

    setIsExporting(true)
    try {
      const filename = `${currentArtifact.title.replace(/\s+/g, "_")}.pdf`
      await exportToPDF(contentRef.current, filename)
      toast.success("Exported to PDF successfully")
    } catch (error) {
      console.error("Export to PDF failed:", error)
      toast.error("Failed to export to PDF")
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportWord = async () => {
    setIsExporting(true)
    try {
      const filename = `${currentArtifact.title.replace(/\s+/g, "_")}.docx`
      await exportToWord(currentArtifact.content, filename)
      toast.success("Exported to Word successfully")
    } catch (error) {
      console.error("Export to Word failed:", error)
      toast.error("Failed to export to Word")
    } finally {
      setIsExporting(false)
    }
  }

  const handleCopyToClipboard = async () => {
    try {
      // Get text content without HTML tags for fallback
      const tempDiv = document.createElement("div")
      tempDiv.innerHTML = currentArtifact.content
      const textContent = tempDiv.textContent || tempDiv.innerText || ""

      // Try to copy with formatting (HTML + plain text) for rich text editors
      if (navigator.clipboard.write) {
        const htmlBlob = new Blob([currentArtifact.content], {
          type: "text/html"
        })
        const textBlob = new Blob([textContent], { type: "text/plain" })

        const data = new ClipboardItem({
          "text/html": htmlBlob,
          "text/plain": textBlob
        })

        await navigator.clipboard.write([data])
        toast.success("Copied with formatting")
      } else {
        // Fallback to plain text for older browsers
        await navigator.clipboard.writeText(textContent)
        toast.success("Copied to clipboard")
      }
    } catch (error) {
      console.error("Copy to clipboard failed:", error)
      // Final fallback
      try {
        const tempDiv = document.createElement("div")
        tempDiv.innerHTML = currentArtifact.content
        const textContent = tempDiv.textContent || tempDiv.innerText || ""
        await navigator.clipboard.writeText(textContent)
        toast.success("Copied to clipboard (plain text)")
      } catch (e) {
        toast.error("Failed to copy to clipboard")
      }
    }
  }

  return (
    <Sheet open={isCanvasOpen} onOpenChange={closeCanvas}>
      <SheetContent
        side="right"
        className={cn(
          "flex flex-col",
          isFullscreen
            ? "size-screen fixed inset-0 max-w-none"
            : "w-full sm:max-w-2xl lg:max-w-4xl"
        )}
      >
        <SheetHeader className="space-y-1">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <SheetTitle className="text-xl">
                {currentArtifact.title}
              </SheetTitle>
              <SheetDescription className="mt-1 text-sm">
                {currentArtifact.type === "document"
                  ? "Editable document"
                  : currentArtifact.type}
              </SheetDescription>
            </div>

            {/* Close and fullscreen buttons */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="size-8"
              >
                {isFullscreen ? (
                  <IconMinimize size={18} />
                ) : (
                  <IconMaximize size={18} />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={closeCanvas}
                className="size-8"
              >
                <IconX size={18} />
              </Button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              className="gap-2"
            >
              {isEditing ? (
                <>
                  <IconCheck size={16} />
                  Done Editing
                </>
              ) : (
                <>
                  <IconEdit size={16} />
                  Edit
                </>
              )}
            </Button>

            <Separator orientation="vertical" className="h-6" />

            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyToClipboard}
              className="gap-2"
            >
              <IconCopy size={16} />
              Copy
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExportPDF}
              disabled={isExporting}
              className="gap-2"
            >
              <IconFileTypePdf size={16} />
              PDF
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExportWord}
              disabled={isExporting}
              className="gap-2"
            >
              <IconFileTypeDocx size={16} />
              Word
            </Button>
          </div>
        </SheetHeader>

        {/* Document content */}
        <div className="bg-background mt-4 flex-1 overflow-hidden rounded-lg border">
          <div ref={contentRef} className="h-full">
            {currentArtifact.type === "document" ? (
              <DocumentEditor
                content={currentArtifact.content}
                onChange={handleContentChange}
                editable={isEditing}
              />
            ) : (
              <div className="p-4">
                <pre className="whitespace-pre-wrap">
                  {currentArtifact.content}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="text-muted-foreground mt-2 flex items-center justify-between text-xs">
          <span>Created: {currentArtifact.createdAt.toLocaleDateString()}</span>
          <span>
            Last updated: {currentArtifact.updatedAt.toLocaleDateString()} at{" "}
            {currentArtifact.updatedAt.toLocaleTimeString()}
          </span>
        </div>
      </SheetContent>
    </Sheet>
  )
}
