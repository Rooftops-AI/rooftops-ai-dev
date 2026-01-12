// @ts-nocheck
// app/api/stripe/webhook/route.ts
import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { stripe } from "@/lib/stripe"
import {
  createSubscription,
  updateSubscription,
  getSubscriptionByStripeId
} from "@/db/subscriptions"
import { STRIPE_PRICE_IDS } from "@/lib/stripe-config"

// Helper to extract plan type from Stripe price ID
function getPlanTypeFromPriceId(priceId: string): string {
  if (
    priceId === STRIPE_PRICE_IDS.premium_monthly ||
    priceId === STRIPE_PRICE_IDS.premium_annual ||
    priceId === STRIPE_PRICE_IDS.premium
  ) {
    return "premium"
  } else if (
    priceId === STRIPE_PRICE_IDS.business_monthly ||
    priceId === STRIPE_PRICE_IDS.business_annual ||
    priceId === STRIPE_PRICE_IDS.business
  ) {
    return "business"
  }
  return "free"
}

// Determine if a plan change is an upgrade
function isUpgrade(oldPlan: string, newPlan: string): boolean {
  const tierOrder = { free: 0, premium: 1, business: 2 }
  return tierOrder[newPlan] > tierOrder[oldPlan]
}

export async function POST(req: Request) {
  const body = await req.text()
  const signature = headers().get("stripe-signature") as string

  let event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error: any) {
    console.error(`⚠️  Webhook signature verification failed.`, error.message)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  console.log(`🔔 Received ${event.type} event`)

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object
        console.log("💰 Checkout session completed:", session.id)

        if (session.mode === "subscription") {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          )

          await createSubscription({
            user_id: session.metadata?.userId!,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: subscription.id,
            status: subscription.status,
            plan_type: session.metadata?.planType || "pro",
            current_period_start: new Date(
              subscription.current_period_start * 1000
            ),
            current_period_end: new Date(subscription.current_period_end * 1000)
          })

          console.log("✅ Subscription created in database")
        }
        break
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object
        console.log("🔄 Subscription updated:", subscription.id)

        // Extract current plan from subscription items
        const priceId = subscription.items?.data?.[0]?.price?.id
        const newPlanType = priceId ? getPlanTypeFromPriceId(priceId) : null

        // Get existing subscription to compare
        const existingSubscription = await getSubscriptionByStripeId(
          subscription.id
        )

        const updates: any = {
          status: subscription.status,
          current_period_start: new Date(
            subscription.current_period_start * 1000
          ),
          current_period_end: new Date(subscription.current_period_end * 1000),
          cancel_at_period_end: subscription.cancel_at_period_end
        }

        // Handle plan changes (upgrades/downgrades)
        if (newPlanType && existingSubscription) {
          const currentPlan = existingSubscription.plan_type || "free"

          if (newPlanType !== currentPlan) {
            if (isUpgrade(currentPlan, newPlanType)) {
              // UPGRADE: Apply immediately with proration
              console.log(
                `⬆️  Upgrade detected: ${currentPlan} → ${newPlanType}`
              )
              updates.plan_type = newPlanType
              updates.scheduled_plan_type = null // Clear any scheduled downgrades
            } else {
              // DOWNGRADE: Schedule for period end
              console.log(
                `⬇️  Downgrade detected: ${currentPlan} → ${newPlanType}`
              )
              updates.scheduled_plan_type = newPlanType
              // Don't change plan_type yet - keep current tier until period ends
            }
          }
        }

        // If we're at period renewal and there's a scheduled downgrade, apply it
        if (
          existingSubscription?.scheduled_plan_type &&
          subscription.status === "active"
        ) {
          const periodStart = new Date(subscription.current_period_start * 1000)
          const now = new Date()
          // If this is a new period (within 1 hour of period start)
          if (Math.abs(now.getTime() - periodStart.getTime()) < 3600000) {
            console.log(
              `📅 Applying scheduled downgrade to ${existingSubscription.scheduled_plan_type}`
            )
            updates.plan_type = existingSubscription.scheduled_plan_type
            updates.scheduled_plan_type = null
          }
        }

        await updateSubscription(subscription.id, updates)

        console.log("✅ Subscription updated in database")
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object
        console.log("❌ Subscription canceled:", subscription.id)

        await updateSubscription(subscription.id, {
          status: "canceled"
        })

        console.log("✅ Subscription canceled in database")
        break
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object

        if (invoice.subscription) {
          console.log(
            "💳 Payment succeeded for subscription:",
            invoice.subscription
          )

          // Update subscription to active if it was past_due
          const subscription = await getSubscriptionByStripeId(
            invoice.subscription as string
          )
          if (subscription && subscription.status !== "active") {
            await updateSubscription(invoice.subscription as string, {
              status: "active"
            })
            console.log("✅ Subscription reactivated")
          }
        }
        break
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object

        if (invoice.subscription) {
          console.log(
            "💸 Payment failed for subscription:",
            invoice.subscription
          )

          await updateSubscription(invoice.subscription as string, {
            status: "past_due"
          })
          console.log("⚠️ Subscription marked as past_due")
        }
        break
      }

      default:
        console.log(`🤷‍♀️ Unhandled event type ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Error processing webhook:", error)
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    )
  }
}
