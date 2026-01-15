// @ts-nocheck
// app/api/stripe/portal/route.ts

import { NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { getServerProfile } from "@/lib/server/server-chat-helpers"
import { getSubscriptionByUserId } from "@/db/subscriptions"

export async function POST(req: NextRequest) {
  try {
    const profile = await getServerProfile()

    if (!profile?.user_id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get subscription to find Stripe customer ID
    const subscription = await getSubscriptionByUserId(profile.user_id)

    if (!subscription?.stripe_customer_id) {
      return NextResponse.json(
        { error: "No active subscription found" },
        { status: 404 }
      )
    }

    // Determine the correct return URL
    // Priority: 1) NEXT_PUBLIC_URL env var, 2) request origin, 3) fallback to rooftops.ai
    let returnUrl = process.env.NEXT_PUBLIC_URL

    // If NEXT_PUBLIC_URL is localhost or not set properly, use request origin
    if (!returnUrl || returnUrl.includes("localhost")) {
      const origin = req.headers.get("origin") || req.headers.get("referer")
      if (origin) {
        returnUrl = new URL(origin).origin
      } else {
        returnUrl = "https://rooftops.ai"
      }
    }

    console.log(`[Stripe Portal] Creating portal session for customer ${subscription.stripe_customer_id}`)
    console.log(`[Stripe Portal] Return URL: ${returnUrl}`)

    // Create portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: returnUrl
    })

    return NextResponse.json({ url: portalSession.url })
  } catch (error: any) {
    console.error("Error creating portal session:", error)
    return NextResponse.json(
      {
        error: "Failed to create portal session",
        details: error.message
      },
      { status: 500 }
    )
  }
}
