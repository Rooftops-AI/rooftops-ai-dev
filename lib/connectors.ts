// Connector types and definitions for OAuth integrations

export type ConnectorType = "google_drive"

export interface ConnectorDefinition {
  type: ConnectorType
  name: string
  description: string
  icon: string
  requiresAuth: boolean
  scopes: string[]
  comingSoon?: boolean
}

export const AVAILABLE_CONNECTORS: ConnectorDefinition[] = [
  {
    type: "google_drive",
    name: "Google Drive",
    description: "Access your Google Drive documents and files",
    icon: "google_drive",
    requiresAuth: true,
    scopes: [
      "https://www.googleapis.com/auth/drive.readonly",
      "https://www.googleapis.com/auth/drive.metadata.readonly"
    ]
  }
]

export function getConnectorDefinition(
  type: ConnectorType
): ConnectorDefinition | undefined {
  return AVAILABLE_CONNECTORS.find(c => c.type === type)
}
