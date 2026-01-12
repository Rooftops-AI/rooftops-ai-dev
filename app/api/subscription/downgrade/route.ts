import { createClient } from "@/lib/supabase/server"
import { getScheduledDowngradeInfo } from "@/lib/entitlements"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = createClient()
    const {
      data: { user }
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const downgradeInfo = await getScheduledDowngradeInfo(user.id)

    return NextResponse.json({ downgradeInfo })
  } catch (error) {
    console.error("Error fetching downgrade info:", error)
    return NextResponse.json(
      { error: "Failed to fetch downgrade info" },
      { status: 500 }
    )
  }
}
