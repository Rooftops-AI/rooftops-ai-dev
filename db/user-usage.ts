// db/user-usage.ts
import { supabase } from "@/lib/supabase/service-role"

export interface UserUsage {
  id: string
  user_id: string
  month: string // Format: YYYY-MM
  reports_generated: number
  chat_messages_premium: number
  chat_messages_free: number
  web_searches: number
  last_chat_date: string | null
  daily_chat_count: number
  created_at: string
  updated_at: string
}

export interface UserUsageInsert {
  user_id: string
  month: string
  reports_generated?: number
  chat_messages_premium?: number
  chat_messages_free?: number
  web_searches?: number
  last_chat_date?: string | null
  daily_chat_count?: number
}

export interface UserUsageUpdate {
  reports_generated?: number
  chat_messages_premium?: number
  chat_messages_free?: number
  web_searches?: number
  last_chat_date?: string | null
  daily_chat_count?: number
}

/**
 * Get current month in YYYY-MM format
 */
export function getCurrentMonth(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  return `${year}-${month}`
}

/**
 * Get user usage for a specific month
 */
export async function getUserUsage(
  userId: string,
  month: string = getCurrentMonth()
): Promise<UserUsage | null> {
  try {
    const { data, error } = await supabase
      .from("user_usage")
      .select("*")
      .eq("user_id", userId)
      .eq("month", month)
      .single()

    // PGRST116 = row not found, which is expected
    if (error && error.code !== "PGRST116") {
      // If table doesn't exist yet, return null (migrations not run)
      if (error.message.includes("Could not find the table")) {
        console.warn(
          "[user-usage] Table user_usage not found. Run migrations: supabase start"
        )
        return null
      }
      throw new Error(`Error fetching user usage: ${error.message}`)
    }

    return data
  } catch (err: any) {
    // Catch any other errors related to missing table
    if (err.message?.includes("Could not find the table")) {
      console.warn(
        "[user-usage] Table user_usage not found. Run migrations: supabase start"
      )
      return null
    }
    throw err
  }
}

/**
 * Get or create user usage for current month
 */
export async function getOrCreateUserUsage(
  userId: string,
  month: string = getCurrentMonth()
): Promise<UserUsage> {
  try {
    const existing = await getUserUsage(userId, month)
    if (existing) {
      return existing
    }

    // Create new usage record for this month
    const { data, error } = await supabase
      .from("user_usage")
      .insert({
        user_id: userId,
        month,
        reports_generated: 0,
        chat_messages_premium: 0,
        chat_messages_free: 0,
        web_searches: 0,
        daily_chat_count: 0,
        last_chat_date: null
      })
      .select()
      .single()

    if (error) {
      // If table doesn't exist, return mock data (migrations not run)
      if (error.message.includes("Could not find the table")) {
        console.warn(
          "[user-usage] Table user_usage not found. Returning mock data. Run: supabase start"
        )
        return {
          id: "mock-id",
          user_id: userId,
          month,
          reports_generated: 0,
          chat_messages_premium: 0,
          chat_messages_free: 0,
          web_searches: 0,
          daily_chat_count: 0,
          last_chat_date: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      }
      throw new Error(`Error creating user usage: ${error.message}`)
    }

    return data
  } catch (err: any) {
    // If table doesn't exist, return mock data
    if (err.message?.includes("Could not find the table")) {
      console.warn(
        "[user-usage] Table user_usage not found. Returning mock data. Run: supabase start"
      )
      return {
        id: "mock-id",
        user_id: userId,
        month,
        reports_generated: 0,
        chat_messages_premium: 0,
        chat_messages_free: 0,
        web_searches: 0,
        daily_chat_count: 0,
        last_chat_date: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    }
    throw err
  }
}

/**
 * Increment report usage
 */
export async function incrementReportUsage(userId: string): Promise<UserUsage> {
  try {
    const month = getCurrentMonth()
    const usage = await getOrCreateUserUsage(userId, month)

    const { data, error } = await supabase
      .from("user_usage")
      .update({
        reports_generated: usage.reports_generated + 1
      })
      .eq("user_id", userId)
      .eq("month", month)
      .select()
      .single()

    if (error) {
      // If table doesn't exist, return mock data (migrations not run)
      if (error.message.includes("Could not find the table")) {
        console.warn(
          "[user-usage] Table user_usage not found. Cannot track usage. Run: supabase db push"
        )
        return usage
      }
      throw new Error(`Error incrementing report usage: ${error.message}`)
    }

    return data
  } catch (err: any) {
    if (err.message?.includes("Could not find the table")) {
      console.warn(
        "[user-usage] Table user_usage not found. Cannot track usage. Run: supabase db push"
      )
      const month = getCurrentMonth()
      return {
        id: "mock-id",
        user_id: userId,
        month,
        reports_generated: 1,
        chat_messages_premium: 0,
        chat_messages_free: 0,
        web_searches: 0,
        daily_chat_count: 0,
        last_chat_date: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    }
    throw err
  }
}

/**
 * Increment chat usage
 */
export async function incrementChatUsage(
  userId: string,
  model: "gpt-4o" | "gpt-4.5-mini" | "gpt-5-mini"
): Promise<UserUsage> {
  try {
    const month = getCurrentMonth()
    const today = new Date().toISOString().split("T")[0]
    const usage = await getOrCreateUserUsage(userId, month)

    // Check if we need to reset daily count
    const needsDailyReset =
      !usage.last_chat_date || usage.last_chat_date !== today

    const updates: UserUsageUpdate = {
      last_chat_date: today
    }

    // Increment the appropriate counter
    if (model === "gpt-4.5-mini" || model === "gpt-5-mini") {
      updates.chat_messages_premium = usage.chat_messages_premium + 1
    } else {
      updates.chat_messages_free = usage.chat_messages_free + 1
    }

    // Handle daily count (for free tier daily limit)
    if (needsDailyReset) {
      updates.daily_chat_count = 1
    } else {
      updates.daily_chat_count = usage.daily_chat_count + 1
    }

    const { data, error } = await supabase
      .from("user_usage")
      .update(updates)
      .eq("user_id", userId)
      .eq("month", month)
      .select()
      .single()

    if (error) {
      // If table doesn't exist, return mock data (migrations not run)
      if (error.message.includes("Could not find the table")) {
        console.warn(
          "[user-usage] Table user_usage not found. Cannot track usage. Run: supabase db push"
        )
        return { ...usage, ...updates }
      }
      throw new Error(`Error incrementing chat usage: ${error.message}`)
    }

    return data
  } catch (err: any) {
    if (err.message?.includes("Could not find the table")) {
      console.warn(
        "[user-usage] Table user_usage not found. Cannot track usage. Run: supabase db push"
      )
      const month = getCurrentMonth()
      const today = new Date().toISOString().split("T")[0]
      return {
        id: "mock-id",
        user_id: userId,
        month,
        reports_generated: 0,
        chat_messages_premium: model === "gpt-5-mini" ? 1 : 0,
        chat_messages_free: model === "gpt-4o" ? 1 : 0,
        web_searches: 0,
        daily_chat_count: 1,
        last_chat_date: today,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    }
    throw err
  }
}

/**
 * Increment web search usage
 */
export async function incrementWebSearchUsage(
  userId: string
): Promise<UserUsage> {
  try {
    const month = getCurrentMonth()
    const usage = await getOrCreateUserUsage(userId, month)

    const { data, error } = await supabase
      .from("user_usage")
      .update({
        web_searches: usage.web_searches + 1
      })
      .eq("user_id", userId)
      .eq("month", month)
      .select()
      .single()

    if (error) {
      // If table doesn't exist, return mock data (migrations not run)
      if (error.message.includes("Could not find the table")) {
        console.warn(
          "[user-usage] Table user_usage not found. Cannot track usage. Run: supabase db push"
        )
        return usage
      }
      throw new Error(`Error incrementing web search usage: ${error.message}`)
    }

    return data
  } catch (err: any) {
    if (err.message?.includes("Could not find the table")) {
      console.warn(
        "[user-usage] Table user_usage not found. Cannot track usage. Run: supabase db push"
      )
      const month = getCurrentMonth()
      return {
        id: "mock-id",
        user_id: userId,
        month,
        reports_generated: 0,
        chat_messages_premium: 0,
        chat_messages_free: 0,
        web_searches: 1,
        daily_chat_count: 0,
        last_chat_date: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    }
    throw err
  }
}

/**
 * Reset daily chat count (called at midnight)
 */
export async function resetDailyChatCount(userId: string): Promise<UserUsage> {
  try {
    const month = getCurrentMonth()
    const usage = await getOrCreateUserUsage(userId, month)

    const { data, error } = await supabase
      .from("user_usage")
      .update({
        daily_chat_count: 0
      })
      .eq("user_id", userId)
      .eq("month", month)
      .select()
      .single()

    if (error) {
      // If table doesn't exist, return mock data (migrations not run)
      if (error.message.includes("Could not find the table")) {
        console.warn(
          "[user-usage] Table user_usage not found. Cannot track usage. Run: supabase db push"
        )
        return usage
      }
      throw new Error(`Error resetting daily chat count: ${error.message}`)
    }

    return data
  } catch (err: any) {
    if (err.message?.includes("Could not find the table")) {
      console.warn(
        "[user-usage] Table user_usage not found. Cannot track usage. Run: supabase db push"
      )
      const month = getCurrentMonth()
      return {
        id: "mock-id",
        user_id: userId,
        month,
        reports_generated: 0,
        chat_messages_premium: 0,
        chat_messages_free: 0,
        web_searches: 0,
        daily_chat_count: 0,
        last_chat_date: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    }
    throw err
  }
}
