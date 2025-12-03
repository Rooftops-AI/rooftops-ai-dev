import { NextResponse } from "next/server"
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

    // Fetch user's OAuth connections
    const { data: connections, error } = await supabase
      .from("oauth_connections")
      .select("id, provider, provider_user_email, connected_at, last_used_at")
      .eq("user_id", user.id)
      .order("connected_at", { ascending: false })

    if (error) {
      throw new Error(error.message)
    }

    return NextResponse.json({ connections: connections || [] })
  } catch (error: any) {
    console.error("Error fetching connections:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch connections" },
      { status: 500 }
    )
  }
}
