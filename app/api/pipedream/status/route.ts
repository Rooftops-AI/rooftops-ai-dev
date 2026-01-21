import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export const runtime = "nodejs"

export async function GET() {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Get connection from database
    const { data: connection, error } = await supabase
      .from("pipedream_connections")
      .select("*")
      .eq("user_id", user.id)
      .single()

    if (error && error.code !== "PGRST116") {
      throw new Error(error.message)
    }

    if (!connection) {
      return NextResponse.json({
        connected: false,
        apps: [],
        tools: []
      })
    }

    return NextResponse.json({
      connected: true,
      projectId: connection.pipedream_project_id,
      connectedApps: connection.connected_apps || [],
      connectedAt: connection.created_at,
      updatedAt: connection.updated_at
    })
  } catch (error: any) {
    console.error("Error fetching Pipedream status:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch status" },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Delete from database
    const { error } = await supabase
      .from("pipedream_connections")
      .delete()
      .eq("user_id", user.id)

    if (error) {
      throw new Error(error.message)
    }

    // Also delete all data sources
    await supabase
      .from("pipedream_data_sources")
      .delete()
      .eq("user_id", user.id)

    return NextResponse.json({
      success: true,
      message: "Pipedream disconnected successfully"
    })
  } catch (error: any) {
    console.error("Error disconnecting Pipedream:", error)
    return NextResponse.json(
      { error: error.message || "Failed to disconnect" },
      { status: 500 }
    )
  }
}
