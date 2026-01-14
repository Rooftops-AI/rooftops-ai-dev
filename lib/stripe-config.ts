// lib/stripe-config.ts
// This file contains constants that can be safely imported in both client and server components

// Stripe price IDs for your subscription plans (LIVE PRODUCTION MODE)
export const STRIPE_PRICE_IDS = {
  premium_monthly: "price_1SWUJsLa49gFMOt641Bw8rZw", // Rooftops AI Premium - $29/month
  premium_annual: "price_PLACEHOLDER_PREMIUM_ANNUAL", // Rooftops AI Premium - $25/month billed annually ($300/year)
  business_monthly: "price_1SWUMvLa49gFMOt6AZ7XpwLO", // Rooftops AI Business - $99/month
  business_annual: "price_PLACEHOLDER_BUSINESS_ANNUAL", // Rooftops AI Business - $84/month billed annually ($1008/year)
  // Backwards compatibility
  premium: "price_1SWUJsLa49gFMOt641Bw8rZw",
  business: "price_1SWUMvLa49gFMOt6AZ7XpwLO"
}

// Plan configurations
export const PLANS = {
  FREE: {
    name: "Free",
    price: 0,
    features: {
      chatMessages: 20,
      propertyReports: 1, // 1 free report
      weatherLookups: 5,
      documentGenerations: 0,
      teamMembers: 1
    }
  },
  PREMIUM: {
    name: "Premium",
    priceMonthly: 29,
    stripeId: "premium",
    features: {
      chatMessages: 1000,
      propertyReports: 10, // 10 reports per month on $29 plan
      weatherLookups: "unlimited",
      documentGenerations: 50,
      teamMembers: 1
    }
  },
  BUSINESS: {
    name: "Business",
    priceMonthly: 99,
    stripeId: "business",
    features: {
      chatMessages: 5000,
      propertyReports: "unlimited", // Unlimited reports on $99 plan
      weatherLookups: "unlimited",
      documentGenerations: "unlimited",
      teamMembers: 10
    }
  }
} as const

export type PlanType = keyof typeof PLANS
