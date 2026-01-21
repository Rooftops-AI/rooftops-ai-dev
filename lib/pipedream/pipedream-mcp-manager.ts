import { Client } from "@modelcontextprotocol/sdk/client/index.js"
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js"
import { Tool } from "@modelcontextprotocol/sdk/types.js"

interface PipedreamConnection {
  client: Client
  transport: SSEClientTransport
  serverUrl: string
  apiKey: string
  tools: Tool[]
}

interface ConnectOptions {
  userId: string
  serverUrl: string
  apiKey: string
}

class PipedreamMCPManager {
  private connections: Map<string, PipedreamConnection> = new Map()

  async connect(options: ConnectOptions): Promise<Client> {
    const { userId, serverUrl, apiKey } = options

    // If already connected, disconnect first
    if (this.connections.has(userId)) {
      await this.disconnect(userId)
    }

    // Create SSE transport for Pipedream MCP server
    const transport = new SSEClientTransport(new URL(serverUrl), {
      requestInit: {
        headers: {
          Authorization: `Bearer ${apiKey}`
        }
      }
    })

    // Create MCP client
    const client = new Client(
      {
        name: "rooftops-pipedream-client",
        version: "1.0.0"
      },
      {
        capabilities: {}
      }
    )

    // Connect to the server
    await client.connect(transport)

    // Fetch available tools
    const toolsResult = await client.listTools()
    const tools = toolsResult.tools || []

    // Store connection
    this.connections.set(userId, {
      client,
      transport,
      serverUrl,
      apiKey,
      tools
    })

    return client
  }

  async disconnect(userId: string): Promise<void> {
    const connection = this.connections.get(userId)
    if (!connection) return

    try {
      await connection.client.close()
    } catch (error) {
      console.error(`Error disconnecting Pipedream for user ${userId}:`, error)
    }

    this.connections.delete(userId)
  }

  async refreshTools(userId: string): Promise<Tool[]> {
    const connection = this.connections.get(userId)
    if (!connection) {
      throw new Error(`No Pipedream connection found for user ${userId}`)
    }

    const toolsResult = await connection.client.listTools()
    connection.tools = toolsResult.tools || []
    return connection.tools
  }

  async listTools(userId: string, enabledApps?: string[]): Promise<Tool[]> {
    const connection = this.connections.get(userId)
    if (!connection) {
      throw new Error(`No Pipedream connection found for user ${userId}`)
    }

    if (!enabledApps || enabledApps.length === 0) {
      return connection.tools
    }

    return this.filterToolsByApps(connection.tools, enabledApps)
  }

  filterToolsByApps(tools: Tool[], enabledApps: string[]): Tool[] {
    return tools.filter(tool => {
      // Pipedream tools are typically prefixed with the app slug
      // e.g., "gmail_send_email", "slack_send_message", "sheets_append_row"
      const toolNameLower = tool.name.toLowerCase()
      return enabledApps.some(app => {
        const appSlug = app.toLowerCase().replace(/[^a-z0-9]/g, "_")
        return toolNameLower.startsWith(appSlug)
      })
    })
  }

  async callTool(
    userId: string,
    toolName: string,
    args: Record<string, unknown>
  ) {
    const connection = this.connections.get(userId)
    if (!connection) {
      throw new Error(`No Pipedream connection found for user ${userId}`)
    }

    const result = await connection.client.callTool({
      name: toolName,
      arguments: args
    })

    return result
  }

  isConnected(userId: string): boolean {
    return this.connections.has(userId)
  }

  getConnection(userId: string): PipedreamConnection | undefined {
    return this.connections.get(userId)
  }

  getToolsForUser(userId: string): Tool[] {
    const connection = this.connections.get(userId)
    return connection?.tools || []
  }
}

// Export singleton instance
export const pipedreamManager = new PipedreamMCPManager()

// Export types
export type { PipedreamConnection, ConnectOptions }
