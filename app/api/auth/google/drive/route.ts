import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const connectorId = searchParams.get("connector_id")
  const code = searchParams.get("code")

  // If no code, initiate OAuth flow
  if (!code) {
    const clientId = process.env.GOOGLE_CLIENT_ID

    if (!clientId) {
      return NextResponse.json(
        {
          error: "Google OAuth not configured",
          message:
            "Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables"
        },
        { status: 500 }
      )
    }

    const redirectUri = `${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}/api/auth/google/drive`
    const scope =
      "https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/drive.metadata.readonly"

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams(
      {
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: "code",
        scope: scope,
        access_type: "offline",
        state: connectorId || "",
        prompt: "consent"
      }
    )}`

    return NextResponse.redirect(authUrl)
  }

  // Handle OAuth callback
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET
    const redirectUri = `${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}/api/auth/google/drive`

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        {
          error: "Google OAuth not configured"
        },
        { status: 500 }
      )
    }

    // Exchange code for access token
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        code: code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code"
      })
    })

    const tokens = await tokenResponse.json()

    if (!tokenResponse.ok) {
      throw new Error(tokens.error_description || "Failed to get access token")
    }

    // Get user info from Google
    const userInfoResponse = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`
        }
      }
    )

    const userInfo = await userInfoResponse.json()

    // Get authenticated user from Supabase
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser()

    if (authError || !user) {
      throw new Error("User not authenticated")
    }

    // Calculate token expiry time
    const expiresAt = tokens.expires_in
      ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
      : null

    // Check if connection already exists
    const { data: existingConnection } = await supabase
      .from("oauth_connections")
      .select("*")
      .eq("user_id", user.id)
      .eq("provider", "google_drive")
      .single()

    if (existingConnection) {
      // Update existing connection
      const { error: updateError } = await supabase
        .from("oauth_connections")
        .update({
          access_token: tokens.access_token,
          refresh_token:
            tokens.refresh_token || existingConnection.refresh_token,
          token_expires_at: expiresAt,
          scopes: tokens.scope ? tokens.scope.split(" ") : [],
          provider_user_id: userInfo.id,
          provider_user_email: userInfo.email,
          updated_at: new Date().toISOString()
        })
        .eq("id", existingConnection.id)

      if (updateError) {
        throw new Error(`Failed to update connection: ${updateError.message}`)
      }
    } else {
      // Create new connection
      const { error: insertError } = await supabase
        .from("oauth_connections")
        .insert({
          user_id: user.id,
          provider: "google_drive",
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          token_expires_at: expiresAt,
          scopes: tokens.scope ? tokens.scope.split(" ") : [],
          provider_user_id: userInfo.id,
          provider_user_email: userInfo.email
        })

      if (insertError) {
        throw new Error(`Failed to create connection: ${insertError.message}`)
      }
    }

    // Redirect back to the app with success
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}/?connector=google_drive&status=connected`
    )
  } catch (error) {
    console.error("Error in Google Drive OAuth:", error)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}/?connector=google_drive&status=error`
    )
  }
}
