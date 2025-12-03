"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { useChatbotUI } from "@/context/context"
import {
  AVAILABLE_CONNECTORS,
  ConnectorDefinition,
  ConnectorType
} from "@/lib/connectors"
import { IconPlug, IconCheck, IconAlertCircle } from "@tabler/icons-react"
import { FC, useState, useEffect } from "react"
import { toast } from "sonner"

interface CreateConnectorProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

interface ConnectorStatus {
  [key: string]: boolean
}

export const CreateConnector: FC<CreateConnectorProps> = ({
  isOpen,
  onOpenChange
}) => {
  const { profile, selectedWorkspace, setTools, tools } = useChatbotUI()
  const [selectedConnector, setSelectedConnector] =
    useState<ConnectorType | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [connectorStatuses, setConnectorStatuses] = useState<ConnectorStatus>(
    {}
  )
  const [showAuthInstructions, setShowAuthInstructions] = useState<
    string | null
  >(null)

  // Check connection status for all connectors
  useEffect(() => {
    const checkStatuses = async () => {
      const statuses: ConnectorStatus = {}
      for (const connector of AVAILABLE_CONNECTORS) {
        try {
          const response = await fetch(
            `/api/mcp/status?connectorType=${connector.type}`
          )
          const data = await response.json()
          statuses[connector.type] = data.connected || false
        } catch (error) {
          statuses[connector.type] = false
        }
      }
      setConnectorStatuses(statuses)
    }

    if (isOpen) {
      checkStatuses()
    }
  }, [isOpen])

  const handleConnect = async (connector: ConnectorDefinition) => {
    if (!profile || !selectedWorkspace) return
    if (connector.comingSoon) {
      toast.info("Coming Soon", {
        description: `${connector.name} integration is coming soon!`
      })
      return
    }

    setSelectedConnector(connector.type)
    setIsCreating(true)
    setShowAuthInstructions(null)

    try {
      // Call connector API to get OAuth URL
      const response = await fetch("/api/mcp/connect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          connectorType: connector.type,
          userId: profile.user_id,
          workspaceId: selectedWorkspace.id
        })
      })

      const data = await response.json()

      if (!response.ok) {
        // Show error message
        if (data.message) {
          setShowAuthInstructions(data.message)
          toast.error("Connection failed", {
            description: data.message
          })
        } else {
          throw new Error(data.error || "Failed to connect")
        }
      } else if (data.authUrl) {
        // Redirect to OAuth consent page
        toast.info("Redirecting to authorization...", {
          description: `Please authorize access to your ${connector.name}`
        })
        window.location.href = data.authUrl
      } else if (data.message === "Already connected") {
        // Already connected
        setConnectorStatuses({
          ...connectorStatuses,
          [connector.type]: true
        })
        toast.info("Already connected", {
          description: `${connector.name} is already connected to your account`
        })
      } else {
        // Success without auth URL (shouldn't happen for OAuth connectors)
        setConnectorStatuses({
          ...connectorStatuses,
          [connector.type]: true
        })
        toast.success("Connected!", {
          description: `${connector.name} has been connected successfully`
        })
      }
    } catch (error) {
      console.error("Error creating connector:", error)
      toast.error("Failed to create connector", {
        description: error instanceof Error ? error.message : "Unknown error"
      })
    } finally {
      setIsCreating(false)
      setSelectedConnector(null)
    }
  }

  const handleDisconnect = async (connector: ConnectorDefinition) => {
    if (!connectorStatuses[connector.type]) return

    try {
      const response = await fetch("/api/mcp/status", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          connectorType: connector.type
        })
      })

      if (!response.ok) {
        throw new Error("Failed to disconnect")
      }

      // Update local state
      setConnectorStatuses({
        ...connectorStatuses,
        [connector.type]: false
      })

      // Remove from tools list
      const connectorTool = tools.find(
        tool =>
          tool.custom_headers &&
          JSON.parse(tool.custom_headers).connector_type === connector.type
      )
      if (connectorTool) {
        setTools(tools.filter(tool => tool.id !== connectorTool.id))
      }

      toast.success("Disconnected", {
        description: `${connector.name} has been disconnected`
      })
    } catch (error) {
      console.error("Error disconnecting:", error)
      toast.error("Failed to disconnect", {
        description: error instanceof Error ? error.message : "Unknown error"
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconPlug size={24} />
            Add Connector
          </DialogTitle>
          <DialogDescription>
            Connect external services to enhance your AI experience
          </DialogDescription>
        </DialogHeader>

        {showAuthInstructions && (
          <div className="bg-muted mb-4 rounded-lg border p-4">
            <div className="mb-2 flex items-center gap-2">
              <IconAlertCircle className="text-amber-500" size={20} />
              <h4 className="font-semibold">Setup Instructions</h4>
            </div>
            <pre className="text-muted-foreground whitespace-pre-wrap text-sm">
              {showAuthInstructions}
            </pre>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 py-4 md:grid-cols-2">
          {AVAILABLE_CONNECTORS.map(connector => {
            const isConnected = connectorStatuses[connector.type] || false

            return (
              <div
                key={connector.type}
                className={`border-border group relative flex flex-col rounded-lg border-2 p-6 transition-all ${
                  connector.comingSoon
                    ? "cursor-not-allowed opacity-60"
                    : isConnected
                      ? "border-green-500 bg-green-50 dark:bg-green-950"
                      : "hover:border-primary cursor-pointer hover:shadow-lg"
                }`}
                onClick={() =>
                  !connector.comingSoon &&
                  !isConnected &&
                  !isCreating &&
                  handleConnect(connector)
                }
              >
                {connector.comingSoon && (
                  <div className="bg-muted text-muted-foreground absolute right-2 top-2 rounded-full px-3 py-1 text-xs font-medium">
                    Coming Soon
                  </div>
                )}

                {isConnected && (
                  <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-green-500 px-3 py-1 text-xs font-medium text-white">
                    <IconCheck size={14} />
                    Connected
                  </div>
                )}

                <div className="mb-4 flex items-center gap-3">
                  <div className="flex size-12 items-center justify-center rounded-lg bg-white p-2 shadow-sm">
                    {connector.type === "google_drive" ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 87.3 78"
                        className="size-8"
                      >
                        <path
                          d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z"
                          fill="#0066da"
                        />
                        <path
                          d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0 -1.2 4.5h27.5z"
                          fill="#00ac47"
                        />
                        <path
                          d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z"
                          fill="#ea4335"
                        />
                        <path
                          d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z"
                          fill="#00832d"
                        />
                        <path
                          d="m59.8 53-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h18.5c1.6 0 3.15-.45 4.5-1.2z"
                          fill="#2684fc"
                        />
                        <path
                          d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z"
                          fill="#ffba00"
                        />
                      </svg>
                    ) : connector.type === "github" ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        className="size-8"
                      >
                        <path
                          fill="currentColor"
                          d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"
                        />
                      </svg>
                    ) : connector.type === "brave_search" ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 48 48"
                        className="size-8"
                      >
                        <path
                          fill="#FB542B"
                          d="M24 4l-4 8h-8l4 8-4 8h8l4 8 4-8h8l-4-8 4-8h-8z"
                        />
                      </svg>
                    ) : connector.type === "filesystem" ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="size-8"
                      >
                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                      </svg>
                    ) : (
                      <IconPlug size={32} className="text-blue-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{connector.name}</h3>
                  </div>
                </div>

                <p className="text-muted-foreground mb-4 text-sm">
                  {connector.description}
                </p>

                {isConnected ? (
                  <Button
                    variant="outline"
                    className="mt-auto border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
                    onClick={e => {
                      e.stopPropagation()
                      handleDisconnect(connector)
                    }}
                  >
                    Disconnect
                  </Button>
                ) : (
                  <Button
                    variant={connector.comingSoon ? "ghost" : "outline"}
                    className="mt-auto"
                    disabled={isCreating || connector.comingSoon}
                  >
                    {isCreating && selectedConnector === connector.type ? (
                      <>
                        <span className="mr-2 size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Connecting...
                      </>
                    ) : connector.comingSoon ? (
                      "Coming Soon"
                    ) : (
                      <>
                        <IconPlug size={16} className="mr-2" />
                        Connect
                      </>
                    )}
                  </Button>
                )}
              </div>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}
