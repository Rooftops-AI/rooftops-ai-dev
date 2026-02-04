import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import {
  calculateMRR,
  calculateARR,
  getDailyNewUsers,
  getDailyReports,
  getDailyMessages,
  getDailyRevenue,
  getUserMetrics,
  getRevenueMetrics,
  getUsageMetrics
} from "@/lib/admin/analytics"

// Helper to check if user is admin
async function isAdmin(supabase: any) {
  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user) return false

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("user_id", user.id)
    .single()

  return profile?.is_admin === true
}

// GET /api/admin/analytics - Get comprehensive analytics data
export async function GET(request: Request) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  if (!(await isAdmin(supabase))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  try {
    // Get date range from query params (default: last 30 days)
    const url = new URL(request.url)
    const days = parseInt(url.searchParams.get("days") || "30")
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(endDate.getDate() - days)

    const startDateStr = startDate.toISOString().split("T")[0]
    const endDateStr = endDate.toISOString().split("T")[0]

    // Fetch all metrics in parallel
    const [
      userMetrics,
      revenueMetrics,
      usageMetrics,
      dailyUsers,
      dailyReports,
      dailyMessages,
      dailyRevenue
    ] = await Promise.all([
      getUserMetrics(),
      getRevenueMetrics(),
      getUsageMetrics(),
      getDailyNewUsers(startDateStr, endDateStr),
      getDailyReports(startDateStr, endDateStr),
      getDailyMessages(startDateStr, endDateStr),
      getDailyRevenue(startDateStr, endDateStr)
    ])

    // Combine daily data into a single timeline
    const timeline = dailyUsers.map((day, index) => ({
      date: day.date,
      newUsers: day.count,
      reports: dailyReports[index]?.count || 0,
      messages: dailyMessages[index]?.count || 0,
      revenue: dailyRevenue[index]?.amount || 0
    }))

    return NextResponse.json({
      userMetrics,
      revenueMetrics,
      usageMetrics,
      timeline,
      dateRange: {
        start: startDateStr,
        end: endDateStr,
        days
      }
    })
  } catch (error) {
    console.error("Error fetching admin analytics:", error)
    return NextResponse.json(
      { error: "Failed to fetch analytics data" },
      { status: 500 }
    )
  }
}
