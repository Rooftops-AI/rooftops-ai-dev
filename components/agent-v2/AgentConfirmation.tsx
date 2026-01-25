"use client"

import { useState } from "react"
import {
  IconAlertTriangle,
  IconCheck,
  IconX,
  IconMail,
  IconCalendar,
  IconBrandSlack,
  IconSend,
  IconLoader2
} from "@tabler/icons-react"
import { cn } from "@/lib/utils"
import { TaskStep } from "./AgentTaskView"

interface AgentConfirmationProps {
  step: TaskStep
  onConfirm: () => void
  onCancel: () => void
  isProcessing?: boolean
}

export function AgentConfirmation({
  step,
  onConfirm,
  onCancel,
  isProcessing = false
}: AgentConfirmationProps) {
  const toolName = step.toolName || "unknown"
  const preview = step.preview
  const config = getConfirmationConfig(toolName)
  const Icon = config.icon

  return (
    <div className="rounded-lg border border-amber-500/50 bg-amber-50 p-4 dark:bg-amber-500/10">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/20">
          <Icon className="size-5 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-foreground font-medium">{config.title}</h3>
          <p className="text-muted-foreground mt-0.5 text-sm">
            {config.description}
          </p>
        </div>
      </div>

      {/* Preview Content */}
      <div className="mt-4">
        <PreviewContent toolName={toolName} preview={preview} />
      </div>

      {/* Actions */}
      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={onConfirm}
          disabled={isProcessing}
          className={cn(
            "bg-primary text-primary-foreground flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
            isProcessing
              ? "cursor-not-allowed opacity-50"
              : "hover:bg-primary/90"
          )}
        >
          {isProcessing ? (
            <>
              <IconLoader2 className="size-4 animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <IconCheck className="size-4" />
              <span>Approve</span>
            </>
          )}
        </button>
        <button
          onClick={onCancel}
          disabled={isProcessing}
          className="border-border bg-background text-foreground hover:bg-muted flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
        >
          <IconX className="size-4" />
          <span>Cancel</span>
        </button>
      </div>
    </div>
  )
}

function PreviewContent({
  toolName,
  preview
}: {
  toolName: string
  preview: any
}) {
  // Email preview
  if (
    toolName.includes("email") ||
    toolName.includes("gmail") ||
    toolName.includes("mail")
  ) {
    return (
      <div className="border-border bg-background rounded-lg border p-4">
        {preview?.to && (
          <div className="flex gap-2 text-sm">
            <span className="text-muted-foreground">To:</span>
            <span className="text-foreground">{preview.to}</span>
          </div>
        )}
        {preview?.subject && (
          <div className="mt-2 flex gap-2 text-sm">
            <span className="text-muted-foreground">Subject:</span>
            <span className="text-foreground font-medium">
              {preview.subject}
            </span>
          </div>
        )}
        {preview?.body && (
          <div className="bg-muted text-foreground mt-3 whitespace-pre-wrap rounded-lg p-3 text-sm">
            {preview.body}
          </div>
        )}
      </div>
    )
  }

  // Calendar event preview
  if (
    toolName.includes("calendar") ||
    toolName.includes("schedule") ||
    toolName.includes("event")
  ) {
    return (
      <div className="border-border bg-background rounded-lg border p-4">
        {preview?.title && (
          <p className="text-foreground font-medium">{preview.title}</p>
        )}
        {preview?.datetime && (
          <p className="text-muted-foreground mt-1 text-sm">
            {preview.datetime}
          </p>
        )}
        {preview?.attendees && preview.attendees.length > 0 && (
          <div className="mt-2 flex gap-2 text-sm">
            <span className="text-muted-foreground">Attendees:</span>
            <span className="text-foreground">
              {preview.attendees.join(", ")}
            </span>
          </div>
        )}
        {preview?.description && (
          <p className="text-muted-foreground mt-3 text-sm">
            {preview.description}
          </p>
        )}
      </div>
    )
  }

  // Slack message preview
  if (toolName.includes("slack")) {
    return (
      <div className="border-border bg-background rounded-lg border p-4">
        {preview?.channel && (
          <div className="flex gap-2 text-sm">
            <span className="text-muted-foreground">Channel:</span>
            <span className="text-foreground">#{preview.channel}</span>
          </div>
        )}
        {preview?.message && (
          <div className="bg-muted text-foreground mt-3 whitespace-pre-wrap rounded-lg p-3 text-sm">
            {preview.message}
          </div>
        )}
      </div>
    )
  }

  // Generic preview
  return (
    <div className="border-border bg-background rounded-lg border p-4">
      <pre className="text-muted-foreground max-h-40 overflow-auto text-sm">
        {JSON.stringify(preview, null, 2)}
      </pre>
    </div>
  )
}

function getConfirmationConfig(toolName: string): {
  icon: any
  title: string
  description: string
} {
  const nameLower = toolName.toLowerCase()

  if (
    nameLower.includes("send") &&
    (nameLower.includes("email") ||
      nameLower.includes("mail") ||
      nameLower.includes("gmail"))
  ) {
    return {
      icon: IconMail,
      title: "Ready to send email",
      description: "Review the email below before sending."
    }
  }

  if (
    nameLower.includes("schedule") ||
    (nameLower.includes("create") && nameLower.includes("event"))
  ) {
    return {
      icon: IconCalendar,
      title: "Create calendar event",
      description: "Review the event details before creating."
    }
  }

  if (nameLower.includes("slack") && nameLower.includes("send")) {
    return {
      icon: IconBrandSlack,
      title: "Send Slack message",
      description: "Review the message before sending."
    }
  }

  // Default
  return {
    icon: IconAlertTriangle,
    title: "Confirm action",
    description: "This action requires your approval to proceed."
  }
}
