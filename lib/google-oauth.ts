import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

interface TokenRefreshResponse {
  access_token: string
  expires_in: number
  scope: string
  token_type: string
}

interface OAuthConnection {
  id: string
  user_id: string
  provider: string
  access_token: string
  refresh_token: string | null
  token_expires_at: string | null
  scopes: string[]
  provider_user_id: string | null
  provider_user_email: string | null
}

/**
 * Get a valid access token for Google Drive, refreshing if necessary
 */
export async function getValidGoogleToken(
  userId: string
): Promise<string | null> {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  // Get the OAuth connection
  const { data: connection, error } = await supabase
    .from("oauth_connections")
    .select("*")
    .eq("user_id", userId)
    .eq("provider", "google_drive")
    .single()

  if (error || !connection) {
    console.error("No Google Drive connection found:", error)
    return null
  }

  // Check if token is expired or about to expire (within 5 minutes)
  const now = new Date()
  const expiresAt = connection.token_expires_at
    ? new Date(connection.token_expires_at)
    : null

  const needsRefresh =
    !expiresAt || expiresAt.getTime() - now.getTime() < 5 * 60 * 1000

  if (!needsRefresh) {
    return connection.access_token
  }

  // Token needs refresh
  if (!connection.refresh_token) {
    console.error("No refresh token available")
    return null
  }

  try {
    const newToken = await refreshGoogleToken(connection.refresh_token)

    // Update the connection with new token
    const expiresAt = new Date(
      Date.now() + newToken.expires_in * 1000
    ).toISOString()

    const { error: updateError } = await supabase
      .from("oauth_connections")
      .update({
        access_token: newToken.access_token,
        token_expires_at: expiresAt,
        updated_at: new Date().toISOString()
      })
      .eq("id", connection.id)

    if (updateError) {
      console.error("Error updating token:", updateError)
      return null
    }

    return newToken.access_token
  } catch (error) {
    console.error("Error refreshing token:", error)
    return null
  }
}

/**
 * Refresh a Google OAuth token using the refresh token
 */
async function refreshGoogleToken(
  refreshToken: string
): Promise<TokenRefreshResponse> {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error("Google OAuth credentials not configured")
  }

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token"
    })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error_description || "Failed to refresh token")
  }

  return await response.json()
}

/**
 * Revoke a Google OAuth token
 */
export async function revokeGoogleToken(token: string): Promise<boolean> {
  try {
    const response = await fetch(
      `https://oauth2.googleapis.com/revoke?token=${token}`,
      {
        method: "POST"
      }
    )

    return response.ok
  } catch (error) {
    console.error("Error revoking token:", error)
    return false
  }
}

/**
 * Get Google Drive files using user's OAuth token
 */
export async function listGoogleDriveFiles(userId: string, pageToken?: string) {
  const token = await getValidGoogleToken(userId)

  if (!token) {
    throw new Error("No valid Google token available")
  }

  const params = new URLSearchParams({
    pageSize: "20",
    fields:
      "nextPageToken, files(id, name, mimeType, modifiedTime, webViewLink, iconLink, thumbnailLink)",
    orderBy: "modifiedTime desc"
  })

  if (pageToken) {
    params.append("pageToken", pageToken)
  }

  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files?${params}`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || "Failed to fetch Drive files")
  }

  return await response.json()
}

/**
 * Get a specific Google Drive file content
 */
export async function getGoogleDriveFile(userId: string, fileId: string) {
  const token = await getValidGoogleToken(userId)

  if (!token) {
    throw new Error("No valid Google token available")
  }

  // First get file metadata
  const metadataResponse = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name,mimeType,size`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  )

  if (!metadataResponse.ok) {
    throw new Error("Failed to fetch file metadata")
  }

  const metadata = await metadataResponse.json()

  // Export Google Docs files as plain text or PDF
  let content = ""
  if (
    metadata.mimeType.includes("application/vnd.google-apps.document") ||
    metadata.mimeType.includes("application/vnd.google-apps.spreadsheet") ||
    metadata.mimeType.includes("application/vnd.google-apps.presentation")
  ) {
    const exportResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text/plain`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    if (exportResponse.ok) {
      content = await exportResponse.text()
    }
  } else {
    // For other files, get the content directly
    const contentResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    if (contentResponse.ok) {
      content = await contentResponse.text()
    }
  }

  return {
    ...metadata,
    content
  }
}
