"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useChatbotUI } from "@/context/context"
import {
  IconCheck,
  IconTrash,
  IconRefresh,
  IconFolder
} from "@tabler/icons-react"
import { FC, useEffect, useState } from "react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Connection {
  id: string
  provider: string
  provider_user_email: string | null
  connected_at: string
  last_used_at: string | null
}

interface DriveFile {
  id: string
  name: string
  mimeType: string
  modifiedTime: string
  webViewLink: string
}

export const ConnectionsList: FC = () => {
  const { profile } = useChatbotUI()
  const [connections, setConnections] = useState<Connection[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedConnection, setSelectedConnection] =
    useState<Connection | null>(null)
  const [driveFiles, setDriveFiles] = useState<DriveFile[]>([])
  const [loadingFiles, setLoadingFiles] = useState(false)
  const [showFileBrowser, setShowFileBrowser] = useState(false)

  const fetchConnections = async () => {
    if (!profile) return

    try {
      const response = await fetch("/api/oauth-connections")
      if (response.ok) {
        const data = await response.json()
        setConnections(data.connections || [])
      }
    } catch (error) {
      console.error("Error fetching connections:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchConnections()
  }, [profile])

  const handleDisconnect = async (connectionId: string, provider: string) => {
    try {
      const response = await fetch("/api/mcp/status", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ connectorType: provider })
      })

      if (!response.ok) {
        throw new Error("Failed to disconnect")
      }

      setConnections(connections.filter(c => c.id !== connectionId))
      toast.success("Disconnected successfully")
    } catch (error) {
      console.error("Error disconnecting:", error)
      toast.error("Failed to disconnect")
    }
  }

  const handleBrowseFiles = async (connection: Connection) => {
    setSelectedConnection(connection)
    setShowFileBrowser(true)
    setLoadingFiles(true)

    try {
      const response = await fetch("/api/google-drive/files")
      if (response.ok) {
        const data = await response.json()
        setDriveFiles(data.files || [])
      } else {
        throw new Error("Failed to fetch files")
      }
    } catch (error) {
      console.error("Error fetching files:", error)
      toast.error("Failed to load files")
    } finally {
      setLoadingFiles(false)
    }
  }

  const handleFileSelect = async (file: DriveFile) => {
    try {
      // Fetch file content
      const response = await fetch(`/api/google-drive/file/${file.id}`)
      if (!response.ok) {
        throw new Error("Failed to fetch file content")
      }

      const fileData = await response.json()

      // Create a message with file content
      const fileContext = `File: ${file.name}\nContent:\n${fileData.content}`

      // Store in session storage to add to next chat message
      sessionStorage.setItem("pendingFileContext", fileContext)
      sessionStorage.setItem("pendingFileName", file.name)

      toast.success(`Added "${file.name}" to context`)
      setShowFileBrowser(false)
    } catch (error) {
      console.error("Error loading file:", error)
      toast.error("Failed to load file content")
    }
  }

  if (loading) {
    return (
      <div className="text-muted-foreground p-4 text-center text-sm">
        Loading connections...
      </div>
    )
  }

  if (connections.length === 0) {
    return (
      <div className="text-muted-foreground p-4 text-center text-sm">
        No connections yet. Click the + button to add a connector.
      </div>
    )
  }

  return (
    <>
      <div className="space-y-2 p-2">
        {connections.map(connection => (
          <Card key={connection.id} className="p-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <IconCheck size={16} className="text-green-500" />
                  <span className="font-medium">
                    {connection.provider === "google_drive"
                      ? "Google Drive"
                      : connection.provider}
                  </span>
                </div>
                {connection.provider_user_email && (
                  <p className="text-muted-foreground mt-1 text-xs">
                    {connection.provider_user_email}
                  </p>
                )}
                <p className="text-muted-foreground mt-1 text-xs">
                  Connected{" "}
                  {new Date(connection.connected_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-1">
                {connection.provider === "google_drive" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleBrowseFiles(connection)}
                    title="Browse files"
                  >
                    <IconFolder size={16} />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    handleDisconnect(connection.id, connection.provider)
                  }
                  className="text-destructive hover:text-destructive"
                  title="Disconnect"
                >
                  <IconTrash size={16} />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={showFileBrowser} onOpenChange={setShowFileBrowser}>
        <DialogContent className="max-h-[80vh] max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Browse Google Drive Files
              {selectedConnection?.provider_user_email && (
                <span className="text-muted-foreground ml-2 text-sm font-normal">
                  ({selectedConnection.provider_user_email})
                </span>
              )}
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="h-[500px] pr-4">
            {loadingFiles ? (
              <div className="flex items-center justify-center py-8">
                <IconRefresh size={24} className="animate-spin" />
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
                    className="hover:bg-accent cursor-pointer p-3 transition-colors"
                    onClick={() => handleFileSelect(file)}
                  >
                    <div className="flex items-center gap-3">
                      <IconFolder size={20} className="text-blue-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{file.name}</p>
                        <p className="text-muted-foreground text-xs">
                          Modified{" "}
                          {new Date(file.modifiedTime).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  )
}
