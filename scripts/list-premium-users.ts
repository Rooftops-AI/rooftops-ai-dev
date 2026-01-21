// scripts/list-premium-users.ts
// Run with: npx tsx --env-file=.env.local scripts/list-premium-users.ts

import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function listPremiumUsers() {
  console.log("\n🔍 Fetching all paid subscribers...\n")

  // Get all active subscriptions (premium and business)
  const { data: subscriptions, error } = await supabase
    .from("subscriptions")
    .select(
      `
      *,
      profiles:user_id (
        display_name,
        username
      )
    `
    )
    .in("status", ["active", "trialing", "past_due"])
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching subscriptions:", error.message)
    process.exit(1)
  }

  if (!subscriptions || subscriptions.length === 0) {
    console.log("No paid subscribers found.")
    return
  }

  // Get user emails from auth.users
  const userIds = subscriptions.map(s => s.user_id)
  const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()

  const emailMap = new Map<string, string>()
  if (!authError && authUsers?.users) {
    authUsers.users.forEach(user => {
      emailMap.set(user.id, user.email || "No email")
    })
  }

  // Separate by plan type
  const premiumUsers = subscriptions.filter(s =>
    s.plan_type?.toLowerCase().includes("premium")
  )
  const businessUsers = subscriptions.filter(s =>
    s.plan_type?.toLowerCase().includes("business")
  )

  console.log("=" .repeat(80))
  console.log(`📊 SUBSCRIPTION SUMMARY`)
  console.log("=" .repeat(80))
  console.log(`Total Paid Subscribers: ${subscriptions.length}`)
  console.log(`Premium Users: ${premiumUsers.length}`)
  console.log(`Business Users: ${businessUsers.length}`)
  console.log("")

  // Display Premium Users
  if (premiumUsers.length > 0) {
    console.log("-".repeat(80))
    console.log("💎 PREMIUM USERS")
    console.log("-".repeat(80))
    premiumUsers.forEach((sub, i) => {
      const profile = sub.profiles as any
      const email = emailMap.get(sub.user_id) || "Unknown"
      console.log(`${i + 1}. ${profile?.display_name || profile?.username || "No name"}`)
      console.log(`   Email: ${email}`)
      console.log(`   Plan: ${sub.plan_type}`)
      console.log(`   Status: ${sub.status}`)
      console.log(`   Period End: ${sub.current_period_end ? new Date(sub.current_period_end).toLocaleDateString() : "N/A"}`)
      console.log(`   Stripe Customer: ${sub.stripe_customer_id}`)
      console.log("")
    })
  }

  // Display Business Users
  if (businessUsers.length > 0) {
    console.log("-".repeat(80))
    console.log("🏢 BUSINESS USERS")
    console.log("-".repeat(80))
    businessUsers.forEach((sub, i) => {
      const profile = sub.profiles as any
      const email = emailMap.get(sub.user_id) || "Unknown"
      console.log(`${i + 1}. ${profile?.display_name || profile?.username || "No name"}`)
      console.log(`   Email: ${email}`)
      console.log(`   Plan: ${sub.plan_type}`)
      console.log(`   Status: ${sub.status}`)
      console.log(`   Period End: ${sub.current_period_end ? new Date(sub.current_period_end).toLocaleDateString() : "N/A"}`)
      console.log(`   Stripe Customer: ${sub.stripe_customer_id}`)
      console.log("")
    })
  }

  // Show raw data option
  console.log("-".repeat(80))
  console.log("📋 RAW SUBSCRIPTION DATA")
  console.log("-".repeat(80))
  console.table(
    subscriptions.map(s => ({
      user_id: s.user_id.substring(0, 8) + "...",
      plan_type: s.plan_type,
      status: s.status,
      period_end: s.current_period_end ? new Date(s.current_period_end).toLocaleDateString() : "N/A",
      cancel_at_period_end: s.cancel_at_period_end ? "Yes" : "No"
    }))
  )
}

listPremiumUsers().catch(console.error)
