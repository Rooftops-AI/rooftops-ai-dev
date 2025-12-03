import { supabase } from "@/lib/supabase/browser-client"
import { TablesInsert, TablesUpdate } from "@/supabase/types"

export const getOAuthConnectionByProvider = async (
  userId: string,
  provider: string
) => {
  const { data, error } = await supabase
    .from("oauth_connections")
    .select("*")
    .eq("user_id", userId)
    .eq("provider", provider)
    .single()

  if (error && error.code !== "PGRST116") {
    throw new Error(error.message)
  }

  return data
}

export const createOAuthConnection = async (
  connection: TablesInsert<"oauth_connections">
) => {
  const { data, error } = await supabase
    .from("oauth_connections")
    .insert([connection])
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export const updateOAuthConnection = async (
  id: string,
  connection: TablesUpdate<"oauth_connections">
) => {
  const { data, error } = await supabase
    .from("oauth_connections")
    .update(connection)
    .eq("id", id)
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export const deleteOAuthConnection = async (
  userId: string,
  provider: string
) => {
  const { error } = await supabase
    .from("oauth_connections")
    .delete()
    .eq("user_id", userId)
    .eq("provider", provider)

  if (error) {
    throw new Error(error.message)
  }

  return true
}

export const updateLastUsed = async (id: string) => {
  const { error } = await supabase
    .from("oauth_connections")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", id)

  if (error) {
    throw new Error(error.message)
  }

  return true
}
