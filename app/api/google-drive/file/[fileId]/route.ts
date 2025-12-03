import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { getGoogleDriveFile } from "@/lib/google-oauth"

export const runtime = "nodejs"

export async function GET(
  request: NextRequest,
  { params }: { params: { fileId: string } }
) {
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

    const { fileId } = params

    if (!fileId) {
      return NextResponse.json(
        { error: "File ID is required" },
        { status: 400 }
      )
    }

    // Get Google Drive file
    const file = await getGoogleDriveFile(user.id, fileId)

    return NextResponse.json(file)
  } catch (error: any) {
    console.error("Error fetching Google Drive file:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch file" },
      { status: 500 }
    )
  }
}
