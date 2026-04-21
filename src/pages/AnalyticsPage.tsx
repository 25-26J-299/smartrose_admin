import { useEffect, useMemo, useState } from "react"
import TopBar from "@/components/layout/TopBar"
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs"
import AreaChart from "@/components/charts/AreaChart"
import BarChart from "@/components/charts/BarChart"
import { fetchDevices, fetchLocations, fetchUsers, type ApiDevice, type ApiLocation, type ApiUser } from "@/lib/api"
import { AlertCircle, Loader2 } from "lucide-react"
import type { ChartDataPoint } from "@/types"

export default function AnalyticsPage() {
  const [users, setUsers] = useState<ApiUser[]>([])
  const [locations, setLocations] = useState<ApiLocation[]>([])
  const [devices, setDevices] = useState<ApiDevice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [registrationRangeMonths, setRegistrationRangeMonths] = useState<3 | 6 | 12>(6)

  const refreshAnalytics = () => {
    Promise.all([fetchUsers(), fetchLocations(), fetchDevices()])
      .then(([u, l, d]) => {
        setUsers(u)
        setLocations(l)
        setDevices(d)
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to refresh analytics"))
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
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load analytics")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const greenhouses = useMemo(
    () => locations.filter((l) => (l.type ?? "").toLowerCase() === "greenhouse"),
    [locations]
  )

  const flowerShops = useMemo(
    () => locations.filter((l) => (l.type ?? "").toLowerCase() === "flower_shop"),
    [locations]
  )

  const summaryRows = useMemo(
    () => [
      { label: "Approved Users", value: users.filter((u) => (u.status ?? "pending") === "approved").length.toString() },
      { label: "Pending Users", value: users.filter((u) => (u.status ?? "pending") === "pending").length.toString() },
      { label: "Active Greenhouses", value: greenhouses.filter((g) => g.is_active ?? true).length.toString() },
      { label: "Inactive Greenhouses", value: greenhouses.filter((g) => !(g.is_active ?? true)).length.toString() },
      { label: "Flower Shops", value: flowerShops.length.toString() },
      {
        label: "Avg Devices per Greenhouse",
        value: greenhouses.length > 0 ? (devices.length / greenhouses.length).toFixed(1) : "0.0",
      },
    ],
    [users, greenhouses, flowerShops, devices]
  )

  const userStatusChart = useMemo<ChartDataPoint[]>(
    () => [
      { date: "Pending", value: users.filter((u) => (u.status ?? "pending") === "pending").length },
      { date: "Approved", value: users.filter((u) => (u.status ?? "pending") === "approved").length },
      { date: "Rejected", value: users.filter((u) => (u.status ?? "pending") === "rejected").length },
    ],
    [users]
  )

  const userRoleChart = useMemo<ChartDataPoint[]>(() => {
    const counts = new Map<string, number>()
    users.forEach((u) => {
      const roles = u.roles?.length ? u.roles : [u.role]
      roles.forEach((role) => counts.set(role, (counts.get(role) ?? 0) + 1))
    })
    return Array.from(counts.entries()).map(([date, value]) => ({ date, value }))
  }, [users])

  const userRegistrationChart = useMemo<ChartDataPoint[]>(() => {
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

  const locationTypeChart = useMemo<ChartDataPoint[]>(
    () => [
      { date: "Greenhouses", value: greenhouses.length },
      { date: "Flower Shops", value: flowerShops.length },
    ],
    [greenhouses, flowerShops]
  )

  const locationStatusChart = useMemo<ChartDataPoint[]>(
    () => [
      { date: "Active", value: greenhouses.filter((g) => g.is_active ?? true).length },
      { date: "Inactive", value: greenhouses.filter((g) => !(g.is_active ?? true)).length },
    ],
    [greenhouses]
  )

  const deviceTypeChart = useMemo<ChartDataPoint[]>(() => {
    const order = ["INM", "EOSM", "EDAS", "FM"]
    return order.map((type) => ({
      date: type,
      value: devices.filter((d) => d.type === type).length,
    }))
  }, [devices])

  const devicesPerLocationChart = useMemo<ChartDataPoint[]>(() => {
    const counts = new Map<string, number>()
    devices.forEach((device) => {
      counts.set(device.location_id, (counts.get(device.location_id) ?? 0) + 1)
    })
    return greenhouses
      .map((loc) => ({
        date: loc.name.length > 12 ? `${loc.name.slice(0, 12)}...` : loc.name,
        value: counts.get(loc._id) ?? 0,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6)
  }, [devices, greenhouses])

  if (loading) {
    return (
      <div className="flex flex-col h-full overflow-hidden">
        <TopBar title="Analytics" subtitle="Real platform analytics across users, locations, and devices." />
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
        <TopBar title="Analytics" subtitle="Real platform analytics across users, locations, and devices." />
        <div className="flex-1 flex flex-col items-center justify-center gap-3 p-6">
          <AlertCircle className="w-10 h-10 text-red-500" />
          <p className="text-sm text-muted-foreground text-center">{error}</p>
          {isSessionExpired ? (
            <Button onClick={() => { window.location.href = "/login" }}>Sign in again</Button>
          ) : (
            <Button onClick={refreshAnalytics}>Retry</Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar title="Analytics" subtitle="Real platform analytics across users, locations, and devices." />

      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        <Card className="border shadow-none overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <p className="text-sm font-semibold">Platform Summary</p>
          </div>
          <div className="divide-y divide-border">
            {summaryRows.map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between px-5 py-3">
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="text-sm font-semibold">{value}</p>
              </div>
            ))}
          </div>
        </Card>

        <Tabs defaultValue="users">
          <TabsList className="mb-4">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="locations">Locations</TabsTrigger>
            <TabsTrigger value="devices">Devices</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="p-5 border shadow-none">
                <p className="text-sm font-semibold mb-1">Users by Approval Status</p>
                <p className="text-xs text-muted-foreground mb-4">Current user pipeline</p>
                <BarChart data={userStatusChart} color="#3b82f6" label="Users" height={220} />
              </Card>
              <Card className="p-5 border shadow-none">
                <p className="text-sm font-semibold mb-1">Users by Role</p>
                <p className="text-xs text-muted-foreground mb-4">Role distribution across accounts</p>
                <BarChart data={userRoleChart} color="#8b5cf6" label="Users" height={220} />
              </Card>
            </div>
            <Card className="p-5 border shadow-none mt-4">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                <p className="text-sm font-semibold">User Registration Trend</p>
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
              <p className="text-xs text-muted-foreground mb-4">
                New users registered in the last {registrationRangeMonths} months
              </p>
              <AreaChart data={userRegistrationChart} color="#22c55e" label="Users" height={240} />
            </Card>
          </TabsContent>

          <TabsContent value="locations">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="p-5 border shadow-none">
                <p className="text-sm font-semibold mb-1">Locations by Type</p>
                <p className="text-xs text-muted-foreground mb-4">Greenhouses vs flower shops</p>
                <BarChart data={locationTypeChart} color="#22c55e" label="Locations" height={220} />
              </Card>
              <Card className="p-5 border shadow-none">
                <p className="text-sm font-semibold mb-1">Greenhouse Status</p>
                <p className="text-xs text-muted-foreground mb-4">Active vs inactive greenhouse count</p>
                <BarChart data={locationStatusChart} color="#f59e0b" label="Greenhouses" height={220} />
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="devices">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="p-5 border shadow-none">
                <p className="text-sm font-semibold mb-1">Devices by Type</p>
                <p className="text-xs text-muted-foreground mb-4">Registered devices across all modules</p>
                <BarChart data={deviceTypeChart} color="#ef4444" label="Devices" height={220} />
              </Card>
              <Card className="p-5 border shadow-none">
                <p className="text-sm font-semibold mb-1">Top Greenhouses by Device Count</p>
                <p className="text-xs text-muted-foreground mb-4">Highest device concentration by greenhouse</p>
                <BarChart data={devicesPerLocationChart} color="#06b6d4" label="Devices" height={220} />
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
