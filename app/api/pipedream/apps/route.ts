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

    // Check for required environment variables
    const clientId = process.env.PIPEDREAM_CLIENT_ID
    const clientSecret = process.env.PIPEDREAM_CLIENT_SECRET
    const projectId = process.env.PIPEDREAM_PROJECT_ID

    if (!clientId || !clientSecret || !projectId) {
      return NextResponse.json({ apps: [] })
    }

    // Get query params
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get("search") || ""
    const pageSize = parseInt(searchParams.get("pageSize") || "30", 10)

    // Use require to avoid Next.js bundling issues
    const { PipedreamClient } = require("@pipedream/sdk")

    const pd = new PipedreamClient({
      clientId,
      clientSecret,
      projectId
    })

    // Get apps with optional search
    const appsPage = await pd.apps.list({
      q: search || undefined
    })

    const apps: Array<{
      id: string
      name_slug: string
      name: string
      description?: string
      img_src?: string
      categories?: string[]
    }> = []

    let count = 0

    for await (const app of appsPage) {
      if (count >= pageSize) break

      apps.push({
        id: app.id || "",
        name_slug: app.nameSlug || "",
        name: app.name || "",
        description: app.description,
        img_src: app.imgSrc,
        categories: app.categories
      })
      count++
    }

    return NextResponse.json({
      apps,
      total: count
    })
  } catch (error: any) {
    console.error("Error fetching Pipedream apps:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch apps" },
      { status: 500 }
    )
  }
}
