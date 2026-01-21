// app/api/subscription/route.ts

import { NextResponse } from "next/server"
import { getServerProfile } from "@/lib/server/server-chat-helpers"
import { getSubscriptionByUserId } from "@/db/subscriptions"

// Normalize plan type (e.g., "premium_monthly" -> "premium")
function normalizePlanType(planType: string | null): string {
  if (!planType) return "free"
  const normalized = planType.toLowerCase()
  if (normalized.startsWith("business")) return "business"
  if (normalized.startsWith("premium")) return "premium"
  return normalized
}

export async function GET() {
  try {
    const profile = await getServerProfile()

    if (!profile?.user_id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's subscription
    const subscription = await getSubscriptionByUserId(profile.user_id)

    // If no subscription, return null
    if (!subscription) {
      return NextResponse.json({ subscription: null })
    }

    // Return normalized subscription data with camelCase keys for frontend
    return NextResponse.json({
      subscription: {
        ...subscription,
        // Include both raw and normalized plan type for flexibility
        plan_type: subscription.plan_type,
        planType: normalizePlanType(subscription.plan_type),
        // Also add tier as an alias for consistency
        tier: normalizePlanType(subscription.plan_type)
      }
    })
  } catch (error) {
    console.error("Error fetching subscription:", error)
    return NextResponse.json(
      { error: "Failed to fetch subscription" },
      { status: 500 }
    )
  }
}
