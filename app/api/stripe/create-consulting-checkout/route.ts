import { NextResponse } from "next/server"

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY

export async function POST(request: Request) {
  try {
    const { successUrl, cancelUrl } = await request.json()

    if (!STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Stripe not configured" },
        { status: 500 }
      )
    }

    // Create Stripe checkout session for consulting
    const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        "mode": "payment",
        "payment_method_types[]": "card",
        "line_items[0][price_data][currency]": "usd",
        "line_items[0][price_data][product_data][name]": "AI Consulting for Roofing Companies - 5 Week Program",
        "line_items[0][price_data][product_data][description]": "1-on-1 AI consulting with Steele Billings. 5 weekly sessions + custom AI setup.",
        "line_items[0][price_data][unit_amount]": "500000", // $5,000 in cents
        "line_items[0][quantity]": "1",
        "success_url": successUrl,
        "cancel_url": cancelUrl,
        "metadata[product_type]": "consulting",
        "metadata[program]": "5_week_ai_transformation"
      })
    })

    const session = await response.json()

    if (!response.ok) {
      console.error("Stripe error:", session)
      return NextResponse.json(
        { error: session.error?.message || "Failed to create checkout session" },
        { status: 400 }
      )
    }

    return NextResponse.json({
      sessionId: session.id,
      url: session.url
    })
  } catch (error) {
    console.error("Checkout creation error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}