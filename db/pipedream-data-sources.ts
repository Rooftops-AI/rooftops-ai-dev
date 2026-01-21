import { supabase } from "@/lib/supabase/browser-client"

export interface PipedreamDataSource {
  id: string
  user_id: string
  chat_id: string | null
  app_slug: string
  app_name: string
  app_icon_url: string | null
  enabled: boolean
  created_at: string
}

export interface CreateDataSourceInput {
  user_id: string
  chat_id?: string | null
  app_slug: string
  app_name: string
  app_icon_url?: string | null
  enabled?: boolean
}

export interface UpdateDataSourceInput {
  enabled?: boolean
  app_icon_url?: string | null
}

export const getDataSources = async (
  userId: string,
  chatId?: string | null
): Promise<PipedreamDataSource[]> => {
  let query = supabase
    .from("pipedream_data_sources")
    .select("*")
    .eq("user_id", userId)

  if (chatId) {
    query = query.eq("chat_id", chatId)
  }

  const { data, error } = await query.order("created_at", { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return data || []
}

export const getDataSourcesByUser = async (
  userId: string
): Promise<PipedreamDataSource[]> => {
  const { data, error } = await supabase
    .from("pipedream_data_sources")
    .select("*")
    .eq("user_id", userId)
    .is("chat_id", null)
    .order("created_at", { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return data || []
}

export const getEnabledDataSources = async (
  userId: string,
  chatId?: string | null
): Promise<PipedreamDataSource[]> => {
  let query = supabase
    .from("pipedream_data_sources")
    .select("*")
    .eq("user_id", userId)
    .eq("enabled", true)

  if (chatId) {
    query = query.eq("chat_id", chatId)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(error.message)
  }

  return data || []
}

export const createDataSource = async (
  source: CreateDataSourceInput
): Promise<PipedreamDataSource> => {
  const { data, error } = await supabase
    .from("pipedream_data_sources")
    .insert([
      {
        ...source,
        enabled: source.enabled !== false
      }
    ])
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export const updateDataSource = async (
  id: string,
  updates: UpdateDataSourceInput
): Promise<PipedreamDataSource> => {
  const { data, error } = await supabase
    .from("pipedream_data_sources")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export const toggleDataSource = async (
  id: string,
  enabled: boolean
): Promise<PipedreamDataSource> => {
  return updateDataSource(id, { enabled })
}

export const deleteDataSource = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from("pipedream_data_sources")
    .delete()
    .eq("id", id)

  if (error) {
    throw new Error(error.message)
  }

  return true
}

export const deleteDataSourcesByApp = async (
  userId: string,
  appSlug: string
): Promise<boolean> => {
  const { error } = await supabase
    .from("pipedream_data_sources")
    .delete()
    .eq("user_id", userId)
    .eq("app_slug", appSlug)

  if (error) {
    throw new Error(error.message)
  }

  return true
}

export const upsertDataSource = async (
  source: CreateDataSourceInput
): Promise<PipedreamDataSource> => {
  const { data, error } = await supabase
    .from("pipedream_data_sources")
    .upsert(
      [
        {
          ...source,
          enabled: source.enabled !== false
        }
      ],
      {
        onConflict: "user_id,chat_id,app_slug"
      }
    )
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}
