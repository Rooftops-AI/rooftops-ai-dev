import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const connectorType = searchParams.get("connectorType")

    if (!connectorType) {
      return NextResponse.json({
        message: "Provide connectorType parameter to check status"
      })
    }

    // Get authenticated user
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({
        connectorType,
        connected: false
      })
    }

    // Check if OAuth connection exists
    const { data: connection } = await supabase
      .from("oauth_connections")
      .select("*")
      .eq("user_id", user.id)
      .eq("provider", connectorType)
      .single()

    return NextResponse.json({
      connectorType,
      connected: !!connection
    })
  } catch (error: any) {
    console.error("Error checking connector status:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { connectorType } = await request.json()

    if (!connectorType) {
      return NextResponse.json(
        { error: "connectorType is required" },
        { status: 400 }
      )
    }

    // Get authenticated user
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Delete OAuth connection
    const { error } = await supabase
      .from("oauth_connections")
      .delete()
      .eq("user_id", user.id)
      .eq("provider", connectorType)

    if (error) {
      throw new Error(error.message)
    }

    return NextResponse.json({
      success: true,
      message: `Disconnected from ${connectorType}`
    })
  } catch (error: any) {
    console.error("Error disconnecting connector:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
