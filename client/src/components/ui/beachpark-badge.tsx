import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "beachpark-status-badge",
  {
    variants: {
      variant: {
        // Status variants
        completed: "beachpark-status-completed",
        "in-progress": "beachpark-status-in-progress",
        "not-started": "beachpark-status-not-started",
        delayed: "beachpark-status-delayed",
        cancelled: "beachpark-status-cancelled",
        
        // Priority variants
        low: "beachpark-priority-low",
        medium: "beachpark-priority-medium",
        high: "beachpark-priority-high",
        critical: "beachpark-priority-critical",
        
        // Generic variants
        default: "bg-secondary text-secondary-foreground",
        primary: "bg-primary text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground",
        destructive: "bg-destructive text-destructive-foreground",
        outline: "border border-border bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function BeachParkBadge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

// Helper function to get status badge
export function getStatusBadge(status: string) {
  const statusMap: Record<string, string> = {
    completed: "completed",
    in_progress: "in-progress", 
    not_started: "not-started",
    delayed: "delayed",
    cancelled: "cancelled",
  }
  
  const statusLabels: Record<string, string> = {
    completed: "Concluído",
    in_progress: "Em Andamento",
    not_started: "Não Iniciado", 
    delayed: "Atrasado",
    cancelled: "Cancelado",
  }

  return {
    variant: statusMap[status] || "default",
    label: statusLabels[status] || status,
  }
}

// Helper function to get priority badge
export function getPriorityBadge(priority: string) {
  const priorityMap: Record<string, string> = {
    low: "low",
    medium: "medium",
    high: "high", 
    critical: "critical",
  }
  
  const priorityLabels: Record<string, string> = {
    low: "Baixa",
    medium: "Média",
    high: "Alta",
    critical: "Crítica",
  }

  return {
    variant: priorityMap[priority] || "default",
    label: priorityLabels[priority] || priority,
  }
}

export { BeachParkBadge, badgeVariants }