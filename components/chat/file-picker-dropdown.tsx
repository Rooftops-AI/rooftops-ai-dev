"use client"

import { FC, useState, useRef, useEffect } from "react"
import {
  IconCirclePlus,
  IconFile,
  IconBrandGoogleDrive,
  IconX
} from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip"

interface DriveFile {
  id: string
  name: string
  mimeType: string
  modifiedTime: string
  webViewLink: string
  size?: number
}

interface FilePickerDropdownProps {
  onLocalFileClick: () => void
  filesToAccept: string
}

export const FilePickerDropdown: FC<FilePickerDropdownProps> = ({
  onLocalFileClick,
  filesToAccept
}) => {
  const router = useRouter()
  const [showDriveBrowser, setShowDriveBrowser] = useState(false)
  const [driveFiles, setDriveFiles] = useState<DriveFile[]>([])
  const [loadingFiles, setLoadingFiles] = useState(false)
  const [hasConnection, setHasConnection] = useState<boolean | null>(null)
  const [loadingConnection, setLoadingConnection] = useState(true)
  const [selectedFile, setSelectedFile] = useState<DriveFile | null>(null)
  const [loadingPreview, setLoadingPreview] = useState(false)
  const [filePreview, setFilePreview] = useState<string>("")

  // Check for Google Drive connection on mount
  useEffect(() => {
    checkConnection()
  }, [])

  const checkConnection = async () => {
    try {
      const response = await fetch("/api/oauth-connections")
      if (response.ok) {
        const data = await response.json()
        const hasDrive = data.connections?.some(
          (c: any) => c.provider === "google_drive"
        )
        setHasConnection(hasDrive)
      } else {
        setHasConnection(false)
      }
    } catch (error) {
      console.error("Error checking connection:", error)
      setHasConnection(false)
    } finally {
      setLoadingConnection(false)
    }
  }

  const handleDriveClick = async () => {
    if (loadingConnection) {
      toast.info("Checking connection...")
      return
    }

    if (!hasConnection) {
      // Redirect to connect Google Drive
      toast.info("Redirecting to connect Google Drive...")
      router.push("/tools")
      return
    }

    // Open Drive browser
    setShowDriveBrowser(true)
    setLoadingFiles(true)

    try {
      const response = await fetch("/api/google-drive/files")
      if (!response.ok) {
        throw new Error("Failed to fetch files")
      }
      const data = await response.json()
      setDriveFiles(data.files || [])
    } catch (error) {
      console.error("Error fetching files:", error)
      toast.error("Failed to load Google Drive files. Try reconnecting.")
    } finally {
      setLoadingFiles(false)
    }
  }

  const handleFilePreview = async (file: DriveFile) => {
    setSelectedFile(file)
    setLoadingPreview(true)
    setFilePreview("")

    try {
      const response = await fetch(`/api/google-drive/file/${file.id}`)
      if (!response.ok) {
        throw new Error("Failed to fetch file content")
      }

      const fileData = await response.json()
      // Show first 500 characters as preview
      const preview =
        fileData.content?.substring(0, 500) || "No preview available"
      setFilePreview(preview + (fileData.content?.length > 500 ? "..." : ""))
    } catch (error) {
      console.error("Error loading preview:", error)
      setFilePreview("Failed to load preview")
    } finally {
      setLoadingPreview(false)
    }
  }

  const handleFileSelect = async (file: DriveFile) => {
    try {
      const response = await fetch(`/api/google-drive/file/${file.id}`)
      if (!response.ok) {
        throw new Error("Failed to fetch file content")
      }

      const fileData = await response.json()
      const fileContext = `File: ${file.name}\nContent:\n${fileData.content}`

      sessionStorage.setItem("pendingFileContext", fileContext)
      sessionStorage.setItem("pendingFileName", file.name)

      toast.success(`Added "${file.name}" to context`)
      setShowDriveBrowser(false)
      setSelectedFile(null)
      setFilePreview("")
    } catch (error) {
      console.error("Error loading file:", error)
      toast.error("Failed to load file content")
    }
  }

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes("document")) return "📄"
    if (mimeType.includes("spreadsheet")) return "📊"
    if (mimeType.includes("presentation")) return "📽️"
    if (mimeType.includes("pdf")) return "📕"
    if (mimeType.includes("image")) return "🖼️"
    return "📁"
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return ""
    const kb = bytes / 1024
    if (kb < 1024) return `${kb.toFixed(1)} KB`
    const mb = kb / 1024
    return `${mb.toFixed(1)} MB`
  }

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <DropdownMenu>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <IconCirclePlus
                  className="cursor-pointer p-1 hover:opacity-50"
                  size={32}
                />
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuItem
                onClick={onLocalFileClick}
                className="cursor-pointer"
              >
                <IconFile size={18} className="mr-2" />
                Local Files
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDriveClick}
                className="cursor-pointer"
              >
                <IconBrandGoogleDrive size={18} className="mr-2" />
                Google Drive
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <TooltipContent>
            <p>Attach files</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Google Drive Browser Dialog */}
      <Dialog open={showDriveBrowser} onOpenChange={setShowDriveBrowser}>
        <DialogContent className="max-h-[80vh] max-w-4xl">
          <DialogHeader>
            <DialogTitle>Select Google Drive File</DialogTitle>
          </DialogHeader>

          <div className="flex gap-4">
            {/* File List */}
            <ScrollArea className="h-[500px] flex-1 pr-4">
              {loadingFiles ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-muted-foreground text-sm">
                    Loading files...
                  </div>
                </div>
              ) : driveFiles.length === 0 ? (
                <div className="text-muted-foreground py-8 text-center text-sm">
                  No files found
                </div>
              ) : (
                <div className="space-y-2">
                  {driveFiles.map(file => (
                    <Card
                      key={file.id}
                      className={`hover:bg-accent cursor-pointer p-3 transition-colors ${
                        selectedFile?.id === file.id
                          ? "border-primary bg-accent"
                          : ""
                      }`}
                      onClick={() => handleFilePreview(file)}
                      onDoubleClick={() => handleFileSelect(file)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">
                          {getFileIcon(file.mimeType)}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{file.name}</p>
                          <p className="text-muted-foreground text-xs">
                            {new Date(file.modifiedTime).toLocaleDateString()}
                            {file.size && ` • ${formatFileSize(file.size)}`}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>

            {/* Preview Panel */}
            {selectedFile && (
              <div className="flex w-1/2 flex-col border-l pl-4">
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <h4 className="font-medium">{selectedFile.name}</h4>
                    <p className="text-muted-foreground text-xs">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleFileSelect(selectedFile)}
                  >
                    Add to Chat
                  </Button>
                </div>

                <div className="bg-muted/50 flex-1 overflow-auto rounded border p-3">
                  {loadingPreview ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-muted-foreground text-sm">
                        Loading preview...
                      </div>
                    </div>
                  ) : (
                    <pre className="whitespace-pre-wrap text-xs">
                      {filePreview}
                    </pre>
                  )}
                </div>

                <p className="text-muted-foreground mt-2 text-xs">
                  Click &ldquo;Add to Chat&rdquo; or double-click the file to
                  attach it
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
