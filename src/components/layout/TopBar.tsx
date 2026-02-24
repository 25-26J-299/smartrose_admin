import { Bell, Search } from "lucide-react"
import { Input } from "@/components/ui/Input"
import { Badge } from "@/components/ui/Badge"

interface TopBarProps {
  title: string
  subtitle?: string
}

export default function TopBar({ title, subtitle }: TopBarProps) {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card shrink-0">
      <div>
        <h1 className="text-xl font-bold text-foreground">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search..." className="pl-9 w-56 h-9 bg-muted border-0 text-sm" />
        </div>
        <button className="relative p-2 rounded-lg hover:bg-muted transition-colors">
          <Bell className="w-5 h-5 text-muted-foreground" />
          <Badge className="absolute -top-0.5 -right-0.5 w-4 h-4 p-0 flex items-center justify-center text-[9px] bg-red-500 border-0 text-white">
            3
          </Badge>
        </button>
      </div>
    </header>
  )
}
