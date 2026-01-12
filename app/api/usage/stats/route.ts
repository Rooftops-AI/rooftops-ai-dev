import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getUserUsageStats } from "@/lib/entitlements"

// GET - Get current user's usage statistics
export async function GET() {
  try {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const {
      data: { user }
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get usage stats using entitlements service
    const stats = await getUserUsageStats(user.id)

    return NextResponse.json({
      tier: stats.tier,
      usage: {
        reports: {
          used: stats.usage.reports_generated,
          limit: stats.limits.reports,
          remaining: Math.max(
            0,
            stats.limits.reports - stats.usage.reports_generated
          )
        },
        chatMessages: {
          usedPremium: stats.usage.chat_messages_premium,
          usedFree: stats.usage.chat_messages_free,
          usedDaily: stats.usage.daily_chat_count,
          limitDaily: stats.limits.chatMessagesDaily,
          limitMonthly: stats.limits.chatMessagesMonthly,
          remainingDaily:
            stats.limits.chatMessagesDaily > 0
              ? Math.max(
                  0,
                  stats.limits.chatMessagesDaily - stats.usage.daily_chat_count
                )
              : -1,
          remainingMonthly:
            stats.limits.chatMessagesMonthly > 0
              ? Math.max(
                  0,
                  stats.limits.chatMessagesMonthly -
                    stats.usage.chat_messages_premium
                )
              : -1
        },
        webSearches: {
          used: stats.usage.web_searches,
          limit: stats.limits.webSearches,
          remaining: Math.max(
            0,
            stats.limits.webSearches - stats.usage.web_searches
          )
        },
        agents: {
          enabled: stats.limits.agents
        }
      }
    })
  } catch (error: any) {
    console.error("Error fetching usage stats:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch usage stats" },
      { status: 500 }
    )
  }
}
