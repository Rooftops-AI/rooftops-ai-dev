// Daily metrics aggregation job
// Run this every day at midnight to capture previous day's stats

import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function updateDailyMetrics() {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const dateStr = yesterday.toISOString().split("T")[0]

  console.log(`Updating metrics for ${dateStr}...`)

  // Get user counts
  const { data: users } = await supabase
    .from("profiles")
    .select("subscription_status, created_at")

  const totalRegistered = users?.length || 0
  const payingUsers = users?.filter(u => 
    u.subscription_status === "active"
  ).length || 0
  const trialingUsers = users?.filter(u => 
    u.subscription_status === "trialing"
  ).length || 0

  // Get new signups yesterday
  const { data: newUsers } = await supabase
    .from("profiles")
    .select("created_at")
    .gte("created_at", `${dateStr}T00:00:00`)
    .lt("created_at", `${dateStr}T23:59:59`)

  const newSignups = newUsers?.length || 0

  // Get MRR
  const { data: subscriptions } = await supabase
    .from("subscriptions")
    .select("plan_type")
    .eq("status", "active")

  const planPrices: Record<string, number> = {
    "premium": 2500,
    "business": 8400,
    "ai_employee": 16900
  }

  const mrrCents = subscriptions?.reduce((total, sub) => {
    return total + (planPrices[sub.plan_type] || 0)
  }, 0) || 0

  // Get usage stats for yesterday
  const { data: yesterdayReports } = await supabase
    .from("reports")
    .select("created_at")
    .gte("created_at", `${dateStr}T00:00:00`)
    .lt("created_at", `${dateStr}T23:59:59`)

  const { data: yesterdayChats } = await supabase
    .from("messages")
    .select("created_at")
    .gte("created_at", `${dateStr}T00:00:00`)
    .lt("created_at", `${dateStr}T23:59:59`)

  // Get total cumulative stats
  const { count: totalReports } = await supabase
    .from("reports")
    .select("*", { count: "exact", head: true })

  const { count: totalChats } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })

  // Upsert the daily metrics
  const { error } = await supabase
    .from("admin_daily_metrics")
    .upsert({
      date: dateStr,
      total_registered_users: totalRegistered,
      total_paying_users: payingUsers,
      total_trialing_users: trialingUsers,
      mrr_cents: mrrCents,
      arr_cents: mrrCents * 12,
      total_reports_generated: totalReports || 0,
      total_chat_messages: totalChats || 0,
      new_signups: newSignups,
      new_paid_conversions: 0, // TODO: Calculate from revenue events
      churned_users: 0 // TODO: Calculate from subscription status changes
    }, {
      onConflict: "date"
    })

  if (error) {
    console.error("Error updating metrics:", error)
    process.exit(1)
  }

  console.log("✅ Daily metrics updated:", {
    date: dateStr,
    totalUsers: totalRegistered,
    payingUsers,
    mrr: mrrCents / 100
  })
}

updateDailyMetrics().catch(console.error)
