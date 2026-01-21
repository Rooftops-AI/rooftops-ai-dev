import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
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

    // Get optional chat_id from query params
    const searchParams = request.nextUrl.searchParams
    const chatId = searchParams.get("chat_id")

    // Build query
    let query = supabase
      .from("pipedream_data_sources")
      .select("*")
      .eq("user_id", user.id)

    if (chatId) {
      query = query.eq("chat_id", chatId)
    } else {
      query = query.is("chat_id", null)
    }

    const { data: dataSources, error } = await query.order("created_at", {
      ascending: true
    })

    if (error) {
      throw new Error(error.message)
    }

    return NextResponse.json({ dataSources: dataSources || [] })
  } catch (error: any) {
    console.error("Error fetching data sources:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch data sources" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { app_slug, app_name, app_icon_url, chat_id, enabled } = body

    if (!app_slug || !app_name) {
      return NextResponse.json(
        { error: "Missing required fields: app_slug and app_name" },
        { status: 400 }
      )
    }

    // Upsert the data source
    const { data: dataSource, error } = await supabase
      .from("pipedream_data_sources")
      .upsert(
        {
          user_id: user.id,
          chat_id: chat_id || null,
          app_slug,
          app_name,
          app_icon_url: app_icon_url || null,
          enabled: enabled !== false
        },
        {
          onConflict: "user_id,chat_id,app_slug"
        }
      )
      .select("*")
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return NextResponse.json({ dataSource })
  } catch (error: any) {
    console.error("Error creating data source:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create data source" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
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

    const body = await request.json()
    const { id, enabled } = body

    if (!id || typeof enabled !== "boolean") {
      return NextResponse.json(
        { error: "Missing required fields: id and enabled" },
        { status: 400 }
      )
    }

    // Update the data source
    const { data: dataSource, error } = await supabase
      .from("pipedream_data_sources")
      .update({ enabled })
      .eq("id", id)
      .eq("user_id", user.id)
      .select("*")
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return NextResponse.json({ dataSource })
  } catch (error: any) {
    console.error("Error updating data source:", error)
    return NextResponse.json(
      { error: error.message || "Failed to update data source" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
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

    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { error: "Missing required parameter: id" },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from("pipedream_data_sources")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id)

    if (error) {
      throw new Error(error.message)
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error deleting data source:", error)
    return NextResponse.json(
      { error: error.message || "Failed to delete data source" },
      { status: 500 }
    )
  }
}
