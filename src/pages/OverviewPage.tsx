import { useEffect, useMemo, useState } from "react"
import TopBar from "@/components/layout/TopBar"
import { Card } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { fetchDevices, fetchLocations, fetchUsers, type ApiDevice, type ApiLocation, type ApiUser } from "@/lib/api"
import { Loader2, AlertCircle } from "lucide-react"
import { formatDate } from "@/lib/utils"
import AreaChart from "@/components/charts/AreaChart"
import BarChart from "@/components/charts/BarChart"
import type { ChartDataPoint } from "@/types"

export default function OverviewPage() {
  const [users, setUsers] = useState<ApiUser[]>([])
  const [locations, setLocations] = useState<ApiLocation[]>([])
  const [devices, setDevices] = useState<ApiDevice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [registrationRangeMonths, setRegistrationRangeMonths] = useState<3 | 6 | 12>(6)

  const refreshOverview = () => {
    Promise.all([fetchUsers(), fetchLocations(), fetchDevices()])
      .then(([u, l, d]) => {
        setUsers(u)
        setLocations(l)
        setDevices(d)
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to refresh overview"))
  }

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    Promise.all([fetchUsers(), fetchLocations(), fetchDevices()])
      .then(([u, l, d]) => {
        if (cancelled) return
        setUsers(u)
        setLocations(l)
        setDevices(d)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load overview")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const stats = useMemo(() => {
    const activeUsers = users.filter((u) => u.is_active).length
    const greenhouses = locations.filter((l) => (l.type ?? "").toLowerCase() === "greenhouse")
    const flowerShops = locations.filter((l) => (l.type ?? "").toLowerCase() === "flower_shop")
    const activeGreenhouses = greenhouses.filter((g) => g.is_active ?? true).length
    return {
      totalUsers: users.length,
      activeUsers,
      totalGreenhouses: greenhouses.length,
      activeGreenhouses,
      totalFlowerShops: flowerShops.length,
      totalDevices: devices.length,
    }
  }, [users, locations, devices])

  const recentUsers = useMemo(
    () =>
      [...users]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5),
    [users]
  )

  const usersByStatusChart = useMemo<ChartDataPoint[]>(() => {
    const pending = users.filter((u) => (u.status ?? "pending") === "pending").length
    const approved = users.filter((u) => (u.status ?? "pending") === "approved").length
    const rejected = users.filter((u) => (u.status ?? "pending") === "rejected").length
    return [
      { date: "Pending", value: pending },
      { date: "Approved", value: approved },
      { date: "Rejected", value: rejected },
    ]
  }, [users])

  const locationTypeChart = useMemo<ChartDataPoint[]>(() => {
    const greenhouses = locations.filter((l) => (l.type ?? "").toLowerCase() === "greenhouse").length
    const flowerShops = locations.filter((l) => (l.type ?? "").toLowerCase() === "flower_shop").length
    return [
      { date: "Greenhouses", value: greenhouses },
      { date: "Flower Shops", value: flowerShops },
    ]
  }, [locations])

  const monthlyUsersChart = useMemo<ChartDataPoint[]>(() => {
    const now = new Date()
    const buckets: { key: string; label: string; count: number }[] = []
    for (let i = registrationRangeMonths - 1; i >= 0; i -= 1) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
      const label = d.toLocaleString("en-US", { month: "short" })
      buckets.push({ key, label, count: 0 })
    }
    const indexByKey = new Map(buckets.map((b, idx) => [b.key, idx]))
    users.forEach((u) => {
      const d = new Date(u.created_at)
      if (Number.isNaN(d.getTime())) return
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
      const idx = indexByKey.get(key)
      if (idx !== undefined) buckets[idx].count += 1
    })
    return buckets.map((b) => ({ date: b.label, value: b.count }))
  }, [users, registrationRangeMonths])

  if (loading) {
    return (
      <div className="flex flex-col h-full overflow-hidden">
        <TopBar title="Overview" subtitle="Admin summary across users, locations, and devices." />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  if (error) {
    const isSessionExpired = error.toLowerCase().includes("session expired") || error.toLowerCase().includes("not authenticated")
    return (
      <div className="flex flex-col h-full overflow-hidden">
        <TopBar title="Overview" subtitle="Admin summary across users, locations, and devices." />
        <div className="flex-1 flex flex-col items-center justify-center gap-3 p-6">
          <AlertCircle className="w-10 h-10 text-red-500" />
          <p className="text-sm text-muted-foreground text-center">{error}</p>
          {isSessionExpired ? (
            <Button onClick={() => { window.location.href = "/login" }}>Sign in again</Button>
          ) : (
            <Button onClick={refreshOverview}>Retry</Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar title="Overview" subtitle="Admin summary across users, locations, and devices." />

      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="p-4 border shadow-none">
            <p className="text-xs text-muted-foreground font-medium">Total Users</p>
            <p className="text-2xl font-bold mt-1">{stats.totalUsers}</p>
            <p className="text-xs text-muted-foreground mt-1">{stats.activeUsers} active</p>
          </Card>
          <Card className="p-4 border shadow-none">
            <p className="text-xs text-muted-foreground font-medium">Greenhouses</p>
            <p className="text-2xl font-bold mt-1">{stats.totalGreenhouses}</p>
            <p className="text-xs text-muted-foreground mt-1">{stats.activeGreenhouses} active</p>
          </Card>
          <Card className="p-4 border shadow-none">
            <p className="text-xs text-muted-foreground font-medium">Flower Shops</p>
            <p className="text-2xl font-bold mt-1">{stats.totalFlowerShops}</p>
          </Card>
          <Card className="p-4 border shadow-none">
            <p className="text-xs text-muted-foreground font-medium">Total Devices</p>
            <p className="text-2xl font-bold mt-1">{stats.totalDevices}</p>
          </Card>
        </div>

        <Card className="p-5 border shadow-none">
          <p className="text-sm font-semibold mb-3">Recent Users</p>
          <div className="space-y-2">
            {recentUsers.map((u) => (
              <div key={u._id} className="flex items-center gap-3 text-sm">
                <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-bold text-accent-foreground">
                    {(u.full_name ?? u.email).split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate leading-tight">{u.full_name ?? "—"}</p>
                  <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                </div>
                <p className="text-xs text-muted-foreground">{formatDate(u.created_at)}</p>
                <Badge className={u.is_active ? "bg-green-100 text-green-700 border-0 text-[10px]" : "bg-red-100 text-red-700 border-0 text-[10px]"}>
                  {u.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
            ))}
            {recentUsers.length === 0 && <p className="text-sm text-muted-foreground">No users found.</p>}
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="p-5 border shadow-none">
            <p className="text-sm font-semibold mb-1">Users by Approval Status</p>
            <p className="text-xs text-muted-foreground mb-3">Current account pipeline</p>
            <BarChart data={usersByStatusChart} color="#3b82f6" label="Users" height={220} />
          </Card>
          <Card className="p-5 border shadow-none">
            <p className="text-sm font-semibold mb-1">Locations by Type</p>
            <p className="text-xs text-muted-foreground mb-3">Greenhouses vs flower shops</p>
            <BarChart data={locationTypeChart} color="#22c55e" label="Locations" height={220} />
          </Card>
        </div>

        <Card className="p-5 border shadow-none">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
            <p className="text-sm font-semibold">New Users</p>
            <div className="flex items-center gap-1 rounded-md border border-border p-1">
              {[3, 6, 12].map((m) => (
                <Button
                  key={m}
                  size="sm"
                  variant={registrationRangeMonths === m ? "default" : "ghost"}
                  className="h-7 px-2 text-xs"
                  onClick={() => setRegistrationRangeMonths(m as 3 | 6 | 12)}
                >
                  {m}m
                </Button>
              ))}
            </div>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Monthly registration trend (last {registrationRangeMonths} months)
          </p>
          <AreaChart data={monthlyUsersChart} color="#8b5cf6" label="New users" height={220} />
        </Card>
      </div>
    </div>
  )
}
