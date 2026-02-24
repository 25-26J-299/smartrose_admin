import { cn } from "@/lib/utils"

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary"
}

export function Badge({ className, variant = "secondary", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
        variant === "secondary" && "bg-secondary text-secondary-foreground",
        variant === "default" && "bg-primary text-primary-foreground",
        className
      )}
      {...props}
    />
  )
}
