import { NextRequest, NextResponse } from "next/server"
import { getConnectorDefinition } from "@/lib/connectors"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const { connectorType, userId, workspaceId } = await request.json()

    if (!connectorType || !userId || !workspaceId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Get connector definition
    const connectorDef = getConnectorDefinition(connectorType)
    if (!connectorDef) {
      return NextResponse.json(
        { error: "Unknown connector type" },
        { status: 400 }
      )
    }

    // Check if connector requires OAuth
    if (!connectorDef.requiresAuth) {
      return NextResponse.json(
        { error: "Connector does not require authentication" },
        { status: 400 }
      )
    }

    // Handle Google Drive OAuth
    if (connectorType === "google_drive") {
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

      // Check if already connected
      const cookieStore = cookies()
      const supabase = createClient(cookieStore)
      const { data: existingConnection } = await supabase
        .from("oauth_connections")
        .select("*")
        .eq("user_id", userId)
        .eq("provider", "google_drive")
        .single()

      if (existingConnection) {
        return NextResponse.json({
          success: true,
          message: "Already connected",
          connectorType,
          authUrl: null
        })
      }

      // Build OAuth URL
      const redirectUri = `${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}/api/auth/google/drive`
      const scope = connectorDef.scopes.join(" ")

      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams(
        {
          client_id: clientId,
          redirect_uri: redirectUri,
          response_type: "code",
          scope: scope,
          access_type: "offline",
          prompt: "consent",
          state: JSON.stringify({ userId, workspaceId })
        }
      )}`

      return NextResponse.json({
        success: true,
        authUrl,
        connectorType,
        message: "Please authorize access to your Google Drive"
      })
    }

    // For other connectors, return error
    return NextResponse.json(
      {
        error: "Connector not implemented",
        message: `${connectorDef.name} integration is not yet available`
      },
      { status: 501 }
    )
  } catch (error: any) {
    console.error("Error in connector auth:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
