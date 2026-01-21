// Define action categories for Pipedream tools
// Used to determine which actions require user confirmation

// Actions that require explicit user confirmation before execution
// These are write operations that could have side effects
export const REQUIRES_CONFIRMATION_PATTERNS = [
  // Email actions
  "send_email",
  "send_message",
  "compose_email",
  "reply_email",
  "forward_email",

  // Messaging actions
  "post_message",
  "send_direct_message",
  "send_dm",

  // CRUD actions
  "create_record",
  "create_row",
  "insert_row",
  "add_row",
  "update_record",
  "update_row",
  "delete_record",
  "delete_row",
  "remove_row",

  // File operations
  "upload_file",
  "delete_file",
  "move_file",
  "copy_file",
  "create_folder",
  "delete_folder",

  // Calendar/scheduling
  "create_event",
  "schedule_event",
  "update_event",
  "delete_event",
  "send_invite",

  // Task management
  "create_task",
  "complete_task",
  "delete_task",
  "assign_task",

  // CRM actions
  "create_contact",
  "update_contact",
  "delete_contact",
  "create_deal",
  "update_deal",
  "create_lead",

  // Social media
  "post_tweet",
  "create_post",
  "publish_post",
  "schedule_post",

  // Payment/financial
  "create_invoice",
  "send_invoice",
  "create_payment",
  "issue_refund",

  // Generic write patterns
  "write",
  "submit",
  "publish",
  "execute"
]

// Read-only actions that can be executed without confirmation
export const READ_ONLY_PATTERNS = [
  "search",
  "list",
  "get",
  "fetch",
  "read",
  "find",
  "query",
  "retrieve",
  "lookup",
  "view",
  "show",
  "check",
  "validate"
]

/**
 * Check if a tool action requires user confirmation
 */
export function requiresConfirmation(toolName: string): boolean {
  const normalizedName = toolName.toLowerCase()

  // Check if it matches any confirmation-required pattern
  return REQUIRES_CONFIRMATION_PATTERNS.some(pattern =>
    normalizedName.includes(pattern)
  )
}

/**
 * Check if a tool action is read-only
 */
export function isReadOnlyAction(toolName: string): boolean {
  const normalizedName = toolName.toLowerCase()

  // Check if it matches any read-only pattern
  return READ_ONLY_PATTERNS.some(pattern => normalizedName.includes(pattern))
}

/**
 * Get the action type for a tool
 */
export function getActionType(
  toolName: string
): "read" | "write" | "destructive" {
  const normalizedName = toolName.toLowerCase()

  // Check for destructive actions first
  if (
    normalizedName.includes("delete") ||
    normalizedName.includes("remove") ||
    normalizedName.includes("destroy")
  ) {
    return "destructive"
  }

  // Check for read-only actions
  if (isReadOnlyAction(toolName)) {
    return "read"
  }

  // Default to write for anything else
  return "write"
}

/**
 * Get a human-readable description of what confirmation is needed
 */
export function getConfirmationMessage(
  toolName: string,
  appName?: string
): string {
  const actionType = getActionType(toolName)
  const appLabel = appName ? ` via ${appName}` : ""

  switch (actionType) {
    case "destructive":
      return `This action will permanently delete data${appLabel}. Are you sure you want to proceed?`
    case "write":
      return `This action will modify data${appLabel}. Do you want to proceed?`
    default:
      return `Do you want to execute this action${appLabel}?`
  }
}
