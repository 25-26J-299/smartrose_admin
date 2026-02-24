import { Card } from "@/components/ui/Card"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  trend?: { value: number; label: string }
  color?: "green" | "blue" | "amber" | "red" | "purple"
  className?: string
}

const colorMap = {
  green: { bg: "bg-green-500/10", icon: "text-green-600" },
  blue: { bg: "bg-blue-500/10", icon: "text-blue-600" },
  amber: { bg: "bg-amber-500/10", icon: "text-amber-600" },
  red: { bg: "bg-red-500/10", icon: "text-red-600" },
  purple: { bg: "bg-purple-500/10", icon: "text-purple-600" },
}

export default function StatCard({ title, value, subtitle, icon: Icon, trend, color = "green", className }: StatCardProps) {
  const colors = colorMap[color]
  return (
    <Card className={cn("p-5 flex flex-col gap-3 border shadow-none", className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold text-foreground mt-1 leading-none">
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
        </div>
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", colors.bg)}>
          <Icon className={cn("w-5 h-5", colors.icon)} />
        </div>
      </div>
      {(subtitle || trend) && (
        <div className="flex items-center gap-2 text-xs">
          {trend && (
            <span className={cn("font-semibold", trend.value >= 0 ? "text-green-600" : "text-red-500")}>
              {trend.value >= 0 ? "+" : ""}{trend.value}%
            </span>
          )}
          {subtitle && <span className="text-muted-foreground">{subtitle}</span>}
        </div>
      )}
    </Card>
  )
}
