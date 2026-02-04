// Set Steele as admin
// Run: npx ts-node scripts/set-admin.ts

import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setAdmin() {
  // Find Steele by email
  const { data: user, error: userError } = await supabase
    .from("profiles")
    .select("user_id, email")
    .eq("email", "sb@rooftops.ai")
    .single()

  if (userError || !user) {
    console.error("User not found:", userError)
    
    // Try alternative emails
    const { data: altUser } = await supabase
      .from("profiles")
      .select("user_id, email")
      .eq("email", "steeleagentic@gmail.com")
      .single()
    
    if (!altUser) {
      console.error("Could not find user by email")
      process.exit(1)
    }
    
    console.log("Found user with alternative email:", altUser.email)
  }

  const userId = user?.user_id

  // Set is_admin = true
  const { error } = await supabase
    .from("profiles")
    .update({ is_admin: true })
    .eq("user_id", userId)

  if (error) {
    console.error("Error setting admin:", error)
    process.exit(1)
  }

  console.log("✅ User is now admin:", user?.email || "steeleagentic@gmail.com")
}

setAdmin().catch(console.error)
