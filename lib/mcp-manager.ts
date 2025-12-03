// MCP Client Manager - Handles connections to MCP servers
// This runs server-side to manage MCP server processes

import { Client } from "@modelcontextprotocol/sdk/client/index.js"
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js"
import type { MCPServerConfig } from "./connectors"

interface MCPClientConnection {
  client: Client
  transport: StdioClientTransport
  connectorType: string
}

class MCPManager {
  private connections: Map<string, MCPClientConnection> = new Map()

  async connect(
    connectorType: string,
    config: MCPServerConfig
  ): Promise<Client> {
    // If already connected, return existing client
    if (this.connections.has(connectorType)) {
      return this.connections.get(connectorType)!.client
    }

    // Create new transport
    const transport = new StdioClientTransport({
      command: config.command,
      args: config.args,
      env: {
        ...process.env,
        ...config.env
      }
    })

    // Create MCP client
    const client = new Client(
      {
        name: "rooftops-ai",
        version: "1.0.0"
      },
      {
        capabilities: {
          // Enable all MCP capabilities
          roots: {
            listChanged: true
          },
          sampling: {}
        }
      }
    )

    // Connect to MCP server
    await client.connect(transport)

    // Store connection
    this.connections.set(connectorType, {
      client,
      transport,
      connectorType
    })

    return client
  }

  async disconnect(connectorType: string): Promise<void> {
    const connection = this.connections.get(connectorType)
    if (connection) {
      await connection.client.close()
      this.connections.delete(connectorType)
    }
  }

  getClient(connectorType: string): Client | undefined {
    return this.connections.get(connectorType)?.client
  }

  isConnected(connectorType: string): boolean {
    return this.connections.has(connectorType)
  }

  async disconnectAll(): Promise<void> {
    const promises = Array.from(this.connections.keys()).map(type =>
      this.disconnect(type)
    )
    await Promise.all(promises)
  }

  // List all available tools from all connected MCP servers
  async listAllTools(): Promise<any[]> {
    const allTools: any[] = []

    for (const [connectorType, connection] of this.connections) {
      try {
        const result = await connection.client.listTools()
        const tools = result.tools.map((tool: any) => ({
          ...tool,
          connectorType,
          source: "mcp"
        }))
        allTools.push(...tools)
      } catch (error) {
        console.error(`Error listing tools from ${connectorType}:`, error)
      }
    }

    return allTools
  }

  // Call a tool on an MCP server
  async callTool(
    connectorType: string,
    toolName: string,
    args: Record<string, any>
  ): Promise<any> {
    const connection = this.connections.get(connectorType)
    if (!connection) {
      throw new Error(`No MCP connection found for ${connectorType}`)
    }

    return await connection.client.callTool({
      name: toolName,
      arguments: args
    })
  }
}

// Singleton instance
export const mcpManager = new MCPManager()
