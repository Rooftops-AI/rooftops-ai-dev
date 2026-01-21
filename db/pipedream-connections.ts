import { supabase } from "@/lib/supabase/browser-client"

// Note: Run the migration and regenerate Supabase types with:
// npm run db-migrate && npm run db-types

export interface PipedreamConnection {
  id: string
  user_id: string
  pipedream_project_id: string
  mcp_server_url: string
  api_key: string
  connected_apps: string[]
  created_at: string
  updated_at: string
}

export interface CreatePipedreamConnectionInput {
  user_id: string
  pipedream_project_id: string
  mcp_server_url: string
  api_key: string
  connected_apps?: string[]
}

export interface UpdatePipedreamConnectionInput {
  pipedream_project_id?: string
  mcp_server_url?: string
  api_key?: string
  connected_apps?: string[]
}

export const getPipedreamConnection = async (
  userId: string
): Promise<PipedreamConnection | null> => {
  const { data, error } = await supabase
    .from("pipedream_connections")
    .select("*")
    .eq("user_id", userId)
    .single()

  if (error && error.code !== "PGRST116") {
    throw new Error(error.message)
  }

  return data
}

export const createPipedreamConnection = async (
  connection: CreatePipedreamConnectionInput
): Promise<PipedreamConnection> => {
  const { data, error } = await supabase
    .from("pipedream_connections")
    .insert([
      {
        ...connection,
        connected_apps: connection.connected_apps || []
      }
    ])
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export const updatePipedreamConnection = async (
  userId: string,
  updates: UpdatePipedreamConnectionInput
): Promise<PipedreamConnection> => {
  const { data, error } = await supabase
    .from("pipedream_connections")
    .update(updates)
    .eq("user_id", userId)
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export const deletePipedreamConnection = async (
  userId: string
): Promise<boolean> => {
  const { error } = await supabase
    .from("pipedream_connections")
    .delete()
    .eq("user_id", userId)

  if (error) {
    throw new Error(error.message)
  }

  return true
}

export const addConnectedApp = async (
  userId: string,
  appSlug: string
): Promise<PipedreamConnection> => {
  // First get current connection
  const connection = await getPipedreamConnection(userId)
  if (!connection) {
    throw new Error("No Pipedream connection found")
  }

  // Add app if not already present
  const connectedApps = connection.connected_apps || []
  if (!connectedApps.includes(appSlug)) {
    connectedApps.push(appSlug)
  }

  return updatePipedreamConnection(userId, { connected_apps: connectedApps })
}

export const removeConnectedApp = async (
  userId: string,
  appSlug: string
): Promise<PipedreamConnection> => {
  // First get current connection
  const connection = await getPipedreamConnection(userId)
  if (!connection) {
    throw new Error("No Pipedream connection found")
  }

  // Remove app
  const connectedApps = (connection.connected_apps || []).filter(
    (app: string) => app !== appSlug
  )

  return updatePipedreamConnection(userId, { connected_apps: connectedApps })
}
