import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { listGoogleDriveFiles } from "@/lib/google-oauth"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  try {
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

    // Get page token from query params
    const searchParams = request.nextUrl.searchParams
    const pageToken = searchParams.get("pageToken") || undefined

    // List Google Drive files
    const files = await listGoogleDriveFiles(user.id, pageToken)

    return NextResponse.json(files)
  } catch (error: any) {
    console.error("Error fetching Google Drive files:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch files" },
      { status: 500 }
    )
  }
}
