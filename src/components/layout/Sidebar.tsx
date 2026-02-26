import { Link, useLocation } from "react-router-dom"
import { clearToken } from "@/lib/api"
import {
  LayoutDashboard,
  Users,
  Clock,
  Warehouse,
  Cpu,
  BarChart3,
  Activity,
  ScrollText,
  LogOut,
  Flower2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { Badge } from "@/components/ui/Badge"

const navItems = [
  { href: "/overview", label: "Overview", icon: LayoutDashboard },
  { href: "/users", label: "Users", icon: Users },
  { href: "/pending-users", label: "Pending Users", icon: Clock },
  { href: "/greenhouses", label: "Greenhouses", icon: Warehouse, badge: "87" },
  { href: "/devices", label: "Devices", icon: Cpu, badge: "23 offline" },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/system", label: "System Health", icon: Activity },
  { href: "/audit-logs", label: "Audit Logs", icon: ScrollText },
]

export default function Sidebar() {
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        "relative flex flex-col h-screen transition-all duration-300 ease-in-out bg-slate-900 border-r border-slate-800",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className={cn("flex items-center gap-3 px-4 py-5 border-b border-slate-800", collapsed && "justify-center px-0")}>
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-600 shrink-0">
          <Flower2 className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div>
            <p className="text-sm font-bold text-white leading-none">SmartRose</p>
            <p className="text-xs text-slate-400 mt-0.5">Admin Console</p>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {navItems.map(({ href, label, icon: Icon, badge }) => {
          const active = location.pathname === href || location.pathname.startsWith(href + "/")
          return (
            <Link
              key={href}
              to={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group",
                active ? "bg-emerald-600 text-white" : "text-slate-300 hover:bg-white/10",
                collapsed && "justify-center px-0"
              )}
              title={collapsed ? label : undefined}
            >
              <Icon className="w-4.5 h-4.5 shrink-0" />
              {!collapsed && (
                <>
                  <span className="flex-1">{label}</span>
                  {badge && (
                    <Badge
                      className={cn(
                        "text-[10px] px-1.5 py-0 border-0",
                        badge.includes("offline") ? "bg-red-500/20 text-red-300" : "bg-white/10 text-slate-400"
                      )}
                    >
                      {badge}
                    </Badge>
                  )}
                </>
              )}
            </Link>
          )
        })}
      </nav>

      <div className={cn("border-t border-slate-800 p-3 space-y-1", collapsed && "flex flex-col items-center")}>
        <button
          type="button"
          onClick={() => { clearToken(); window.location.href = "/login"; }}
          className={cn(
            "flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-white/10 transition-colors",
            collapsed && "justify-center px-0 w-auto"
          )}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
        {!collapsed && (
          <div className="flex items-center gap-2 px-3 py-2">
            <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center shrink-0">
              <span className="text-[10px] font-bold text-white">SA</span>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-white truncate">Super Admin</p>
              <p className="text-[10px] text-slate-400 truncate">chami@gmail.com</p>
            </div>
          </div>
        )}
      </div>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 hover:bg-emerald-600 transition-colors z-10"
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </aside>
  )
}
