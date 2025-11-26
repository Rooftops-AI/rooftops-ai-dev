// lib/stripe.ts
// This file is for SERVER-SIDE ONLY usage (API routes, server components)
// For constants that can be used in client components, import from './stripe-config'

import Stripe from "stripe"

// Lazy initialization to avoid build-time errors when STRIPE_SECRET_KEY is not set
let stripeInstance: Stripe | null = null

function getStripe(): Stripe {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not set in environment variables")
    }
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16",
      typescript: true
    })
  }
  return stripeInstance
}

export const stripe = new Proxy({} as Stripe, {
  get(target, prop) {
    return getStripe()[prop as keyof Stripe]
  }
})

// Re-export constants for convenience (but they can also be imported from stripe-config)
export { STRIPE_PRICE_IDS, PLANS, type PlanType } from "./stripe-config"
