import { cn } from "@/lib/utils"
import type { ButtonHTMLAttributes } from "react"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "ghost" | "secondary" | "outline" | "destructive"
  size?: "sm" | "default" | "icon"
}

export function Button({ className, variant = "default", size = "default", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center font-medium transition-colors rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
        variant === "default" && "bg-primary text-primary-foreground hover:bg-primary/90",
        variant === "ghost" && "hover:bg-accent hover:text-accent-foreground",
        variant === "secondary" && "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        variant === "outline" && "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        variant === "destructive" && "bg-red-600 text-white hover:bg-red-700",
        size === "sm" && "h-8 px-3 text-xs",
        size === "default" && "h-9 px-4 text-sm",
        size === "icon" && "h-9 w-9",
        className
      )}
      {...props}
    />
  )
}
