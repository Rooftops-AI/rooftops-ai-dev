import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export const runtime = "nodejs"

// Debug endpoint to check Pipedream state
export async function GET() {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated", userId: null })
    }

    // Get data sources
    const { data: dataSources, error: dsError } = await supabase
      .from("pipedream_data_sources")
      .select("*")
      .eq("user_id", user.id)

    // Get connections
    const { data: connections, error: connError } = await supabase
      .from("pipedream_connections")
      .select("*")
      .eq("user_id", user.id)

    // Check env vars
    const envCheck = {
      hasClientId: !!process.env.PIPEDREAM_CLIENT_ID,
      hasClientSecret: !!process.env.PIPEDREAM_CLIENT_SECRET,
      hasProjectId: !!process.env.PIPEDREAM_PROJECT_ID,
      projectId: process.env.PIPEDREAM_PROJECT_ID
    }

    return NextResponse.json({
      userId: user.id,
      email: user.email,
      dataSources: dataSources || [],
      dataSourcesError: dsError?.message,
      connections: connections || [],
      connectionsError: connError?.message,
      envCheck
    })
  } catch (error: any) {
    return NextResponse.json({
      error: error.message || "Unknown error"
    })
  }
}

// POST to enable all data sources
export async function POST() {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" })
    }

    // Enable all data sources for this user
    const { data, error } = await supabase
      .from("pipedream_data_sources")
      .update({ enabled: true })
      .eq("user_id", user.id)
      .select()

    if (error) {
      return NextResponse.json({ error: error.message })
    }

    return NextResponse.json({
      message: "All data sources enabled",
      updated: data?.length || 0,
      dataSources: data
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message })
  }
}
