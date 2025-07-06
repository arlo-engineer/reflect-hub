"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "default" | "lg" | "xl"
  variant?: "default" | "secondary" | "muted" | "white"
  label?: string
}

const LoadingSpinner = React.forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  ({ className, size = "default", variant = "default", label, ...props }, ref) => {
    const sizeClasses: Record<string, string> = {
      sm: "h-4 w-4",
      default: "h-6 w-6",
      lg: "h-8 w-8",
      xl: "h-12 w-12",
    }

    const variantClasses: Record<string, string> = {
      default: "text-primary",
      secondary: "text-secondary-foreground",
      muted: "text-muted-foreground",
      white: "text-white",
    }

    return (
      <div
        ref={ref}
        className={cn("flex items-center justify-center", className)}
        {...props}
      >
        <div
          className={cn(
            "animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]",
            sizeClasses[size],
            variantClasses[variant]
          )}
          role="status"
          aria-label={label || "Loading"}
        >
          <span className="sr-only">{label || "Loading..."}</span>
        </div>
      </div>
    )
  }
)
LoadingSpinner.displayName = "LoadingSpinner"

// Inline loading spinner for buttons and inline elements
const InlineLoadingSpinner = React.forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  ({ className, size = "sm", variant = "white", ...props }, ref) => {
    const sizeClasses = {
      sm: "h-4 w-4",
      default: "h-6 w-6",
      lg: "h-8 w-8",
      xl: "h-12 w-12",
    }

    const variantClasses = {
      default: "text-primary",
      secondary: "text-secondary-foreground",
      muted: "text-muted-foreground",
      white: "text-white",
    }

    return (
      <div
        ref={ref}
        className={cn(
          "animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]",
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        role="status"
        aria-label="Loading"
        {...props}
      >
        <span className="sr-only">Loading...</span>
      </div>
    )
  }
)
InlineLoadingSpinner.displayName = "InlineLoadingSpinner"

// Full page loading spinner
const FullPageLoadingSpinner = React.forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  ({ className, size = "xl", variant = "default", label, ...props }, ref) => {
    const sizeClasses = {
      sm: "h-4 w-4",
      default: "h-6 w-6",
      lg: "h-8 w-8",
      xl: "h-12 w-12",
    }

    const variantClasses = {
      default: "text-primary",
      secondary: "text-secondary-foreground",
      muted: "text-muted-foreground",
      white: "text-white",
    }

    return (
      <div
        ref={ref}
        className={cn(
          "fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm",
          className
        )}
        {...props}
      >
        <div className="flex flex-col items-center gap-4">
          <div
            className={cn(
              "animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]",
              sizeClasses[size],
              variantClasses[variant]
            )}
            role="status"
            aria-label={label || "Loading"}
          >
            <span className="sr-only">{label || "Loading..."}</span>
          </div>
          {label && (
            <p className="text-muted-foreground text-sm">{label}</p>
          )}
        </div>
      </div>
    )
  }
)
FullPageLoadingSpinner.displayName = "FullPageLoadingSpinner"

export { LoadingSpinner, InlineLoadingSpinner, FullPageLoadingSpinner }