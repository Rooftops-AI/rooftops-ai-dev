"use client"

import {
  IconX,
  IconCheck,
  IconAlertCircle,
  IconClock,
  IconSparkles
} from "@tabler/icons-react"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"

export interface TaskSummary {
  id: string
  goal: string
  status: "completed" | "failed" | "cancelled"
  completedAt: Date
  stepCount: number
}

interface AgentHistoryProps {
  tasks: TaskSummary[]
  onClose: () => void
}

export function AgentHistory({ tasks, onClose }: AgentHistoryProps) {
  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-border flex items-center justify-between border-b px-4 py-3">
        <h2 className="text-foreground font-medium">Recent Tasks</h2>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg p-1.5 transition-colors"
        >
          <IconX className="size-5" />
        </button>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="bg-muted flex size-12 items-center justify-center rounded-xl">
              <IconClock className="text-muted-foreground size-6" />
            </div>
            <p className="text-muted-foreground mt-4 text-sm">
              No recent tasks yet.
            </p>
            <p className="text-muted-foreground mt-1 text-sm">
              Tasks you run will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-border divide-y">
            {tasks.map((task, index) => (
              <TaskHistoryItem key={`${task.id}-${index}`} task={task} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function TaskHistoryItem({ task }: { task: TaskSummary }) {
  const statusConfig = getStatusConfig(task.status)
  const StatusIcon = statusConfig.icon

  return (
    <div className="hover:bg-muted/50 p-4 transition-colors">
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-lg",
            statusConfig.bgClass
          )}
        >
          <StatusIcon className={cn("size-4", statusConfig.iconClass)} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-foreground line-clamp-2 text-sm font-medium">
            {task.goal}
          </p>
          <div className="text-muted-foreground mt-1 flex items-center gap-2 text-xs">
            <span className={statusConfig.textClass}>{statusConfig.label}</span>
            <span>·</span>
            <span>
              {task.stepCount} step{task.stepCount !== 1 ? "s" : ""}
            </span>
            <span>·</span>
            <span>
              {formatDistanceToNow(task.completedAt, { addSuffix: true })}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function getStatusConfig(status: TaskSummary["status"]) {
  switch (status) {
    case "completed":
      return {
        icon: IconCheck,
        label: "Completed",
        bgClass: "bg-green-500/10",
        iconClass: "text-green-500",
        textClass: "text-green-600 dark:text-green-400"
      }
    case "failed":
      return {
        icon: IconAlertCircle,
        label: "Failed",
        bgClass: "bg-destructive/10",
        iconClass: "text-destructive",
        textClass: "text-destructive"
      }
    case "cancelled":
      return {
        icon: IconX,
        label: "Cancelled",
        bgClass: "bg-muted",
        iconClass: "text-muted-foreground",
        textClass: "text-muted-foreground"
      }
  }
}
