import { useEffect, useMemo, useState } from "react"
import TopBar from "@/components/layout/TopBar"
import { Card } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { fetchDevices, fetchLocations, fetchUsers, type ApiDevice, type ApiLocation, type ApiUser } from "@/lib/api"
import { Loader2, AlertCircle, Users, Warehouse, Store, Cpu, ArrowUpRight } from "lucide-react"
import { formatDate } from "@/lib/utils"

export default function OverviewPage() {
  const [users, setUsers] = useState<ApiUser[]>([])
  const [locations, setLocations] = useState<ApiLocation[]>([])
  const [devices, setDevices] = useState<ApiDevice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
    const activeFlowerShops = flowerShops.filter((g) => g.is_active ?? true).length
    return {
      totalUsers: users.length,
      activeUsers,
      totalGreenhouses: greenhouses.length,
      activeGreenhouses,
      totalFlowerShops: flowerShops.length,
      activeFlowerShops,
      totalDevices: devices.length,
    }
  }, [users, locations, devices])

  const usersById = useMemo(() => new Map(users.map((u) => [u._id, u])), [users])
  const locationsById = useMemo(() => new Map(locations.map((l) => [l._id, l])), [locations])

  const attentionStats = useMemo(() => {
    const pendingUsers = users.filter((u) => (u.status ?? "pending") === "pending").length
    const inactiveUsers = users.filter((u) => !u.is_active).length
    const greenhouseLocations = locations.filter((l) => (l.type ?? "").toLowerCase() === "greenhouse")
    const flowerShopLocations = locations.filter((l) => (l.type ?? "").toLowerCase() === "flower_shop")
    const inactiveGreenhouses = greenhouseLocations.filter((l) => !(l.is_active ?? true)).length
    const inactiveFlowerShops = flowerShopLocations.filter((l) => !(l.is_active ?? true)).length
    const deviceCounts = new Map<string, number>()
    devices.forEach((d) => {
      deviceCounts.set(d.location_id, (deviceCounts.get(d.location_id) ?? 0) + 1)
    })
    const greenhousesWithoutDevices = greenhouseLocations.filter((l) => (deviceCounts.get(l._id) ?? 0) === 0).length
    const flowerShopsWithoutDevices = flowerShopLocations.filter((l) => (deviceCounts.get(l._id) ?? 0) === 0).length
    return {
      pendingUsers,
      inactiveUsers,
      inactiveGreenhouses,
      inactiveFlowerShops,
      greenhousesWithoutDevices,
      flowerShopsWithoutDevices,
    }
  }, [users, locations, devices])

  const recentGreenhouses = useMemo(() => {
    const deviceCounts = new Map<string, number>()
    devices.forEach((d) => {
      deviceCounts.set(d.location_id, (deviceCounts.get(d.location_id) ?? 0) + 1)
    })
    return locations
      .filter((l) => (l.type ?? "").toLowerCase() === "greenhouse")
      .sort((a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime())
      .slice(0, 5)
      .map((loc) => ({
        ...loc,
        owner_name: usersById.get(loc.user_id)?.full_name ?? "—",
        device_count: deviceCounts.get(loc._id) ?? 0,
      }))
  }, [locations, devices, usersById])

  const recentFlowerShops = useMemo(() => {
    const deviceCounts = new Map<string, number>()
    devices.forEach((d) => {
      deviceCounts.set(d.location_id, (deviceCounts.get(d.location_id) ?? 0) + 1)
    })
    return locations
      .filter((l) => (l.type ?? "").toLowerCase() === "flower_shop")
      .sort((a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime())
      .slice(0, 5)
      .map((loc) => ({
        ...loc,
        owner_name: usersById.get(loc.user_id)?.full_name ?? "—",
        device_count: deviceCounts.get(loc._id) ?? 0,
      }))
  }, [locations, devices, usersById])

  const recentDevices = useMemo(() => {
    return [...devices]
      .sort((a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime())
      .slice(0, 5)
      .map((device) => ({
        ...device,
        location_name: device.location_name ?? locationsById.get(device.location_id)?.name ?? "—",
        user_name: device.user_name ?? usersById.get(device.user_id)?.full_name ?? "—",
      }))
  }, [devices, locationsById, usersById])

  const platformTiles = [
    {
      label: "Users",
      value: stats.totalUsers,
      detail: `${stats.activeUsers} active accounts`,
      icon: Users,
      tileClass: "border-blue-200/70 bg-blue-50/70",
      iconClass: "bg-blue-100 text-blue-700",
    },
    {
      label: "Greenhouses",
      value: stats.totalGreenhouses,
      detail: `${stats.activeGreenhouses} active locations`,
      icon: Warehouse,
      tileClass: "border-emerald-200/70 bg-emerald-50/70",
      iconClass: "bg-emerald-100 text-emerald-700",
    },
    {
      label: "Flower Shops",
      value: stats.totalFlowerShops,
      detail: `${stats.activeFlowerShops} active locations`,
      icon: Store,
      tileClass: "border-fuchsia-200/70 bg-fuchsia-50/70",
      iconClass: "bg-fuchsia-100 text-fuchsia-700",
    },
    {
      label: "Devices",
      value: stats.totalDevices,
      detail: "Connected across all locations",
      icon: Cpu,
      tileClass: "border-violet-200/70 bg-violet-50/70",
      iconClass: "bg-violet-100 text-violet-700",
    },
  ] as const

  const attentionItems = [
    {
      label: "Pending user approvals",
      value: attentionStats.pendingUsers,
      helper: "Accounts waiting for review",
      colorClass: "bg-amber-500",
      badgeClass: "bg-amber-100 text-amber-700",
    },
    {
      label: "Inactive users",
      value: attentionStats.inactiveUsers,
      helper: "User accounts currently disabled",
      colorClass: "bg-rose-500",
      badgeClass: "bg-rose-100 text-rose-700",
    },
    {
      label: "Inactive greenhouses",
      value: attentionStats.inactiveGreenhouses,
      helper: "Farmer locations not active",
      colorClass: "bg-emerald-500",
      badgeClass: "bg-emerald-100 text-emerald-700",
    },
    {
      label: "Inactive flower shops",
      value: attentionStats.inactiveFlowerShops,
      helper: "Florist locations not active",
      colorClass: "bg-fuchsia-500",
      badgeClass: "bg-fuchsia-100 text-fuchsia-700",
    },
    {
      label: "Greenhouses without devices",
      value: attentionStats.greenhousesWithoutDevices,
      helper: "Locations that still need device setup",
      colorClass: "bg-lime-500",
      badgeClass: "bg-lime-100 text-lime-700",
    },
    {
      label: "Flower shops without devices",
      value: attentionStats.flowerShopsWithoutDevices,
      helper: "Locations that still need device setup",
      colorClass: "bg-sky-500",
      badgeClass: "bg-sky-100 text-sky-700",
    },
  ] as const

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

      <div className="flex-1 overflow-y-auto bg-slate-50/60 p-6">
        <div className="space-y-5">
          <Card className="overflow-hidden border shadow-none">
            <div className="grid gap-4 p-5 lg:grid-cols-[1.3fr_0.9fr]">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {platformTiles.map((tile) => {
                  const Icon = tile.icon
                  return (
                    <div key={tile.label} className={`rounded-2xl border p-4 ${tile.tileClass}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-slate-700">{tile.label}</p>
                          <p className="mt-2 text-3xl font-bold text-slate-900">{tile.value}</p>
                          <p className="mt-1 text-xs text-slate-600">{tile.detail}</p>
                        </div>
                        <div className={`rounded-xl p-2 ${tile.iconClass}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="rounded-2xl border bg-slate-50 p-4">
                <div className="flex items-center gap-2">
                  <div className="rounded-xl bg-amber-100 p-2 text-amber-700">
                    <ArrowUpRight className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Operational highlights</p>
                    <p className="text-xs text-muted-foreground">Quick context without opening analytics</p>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="rounded-xl border bg-white p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-slate-700">Active users</p>
                      <p className="text-lg font-semibold text-slate-900">{stats.activeUsers}</p>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">Currently enabled accounts on the platform.</p>
                  </div>
                  <div className="rounded-xl border bg-white p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-slate-700">Active locations</p>
                      <p className="text-lg font-semibold text-slate-900">
                        {stats.activeGreenhouses + stats.activeFlowerShops}
                      </p>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Combined total of active greenhouses and flower shops.
                    </p>
                  </div>
                  <div className="rounded-xl border bg-white p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-slate-700">Total locations</p>
                      <p className="text-lg font-semibold text-slate-900">
                        {stats.totalGreenhouses + stats.totalFlowerShops}
                      </p>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Coverage across farmer and florist business locations.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="border shadow-none">
            <div className="flex flex-col gap-2 border-b px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">Attention summary</p>
                <p className="text-xs text-muted-foreground">Items that may need admin follow-up soon.</p>
              </div>
            </div>
            <div className="grid gap-3 p-5 md:grid-cols-2 xl:grid-cols-3">
              {attentionItems.map((item) => (
                <div key={item.label} className="rounded-2xl border bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span className={`mt-1 h-2.5 w-2.5 rounded-full ${item.colorClass}`} />
                      <div>
                        <p className="text-sm font-medium text-slate-800">{item.label}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{item.helper}</p>
                      </div>
                    </div>
                    <Badge className={`border-0 ${item.badgeClass}`}>{item.value}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            <Card className="border shadow-none">
              <div className="border-b px-5 py-4">
                <p className="text-sm font-semibold text-slate-900">Recent Greenhouses</p>
                <p className="text-xs text-muted-foreground">Latest farmer-side locations added to the platform.</p>
              </div>
              <div className="space-y-3 p-4">
                {recentGreenhouses.map((gh) => (
                  <div key={gh._id} className="flex items-center gap-3 rounded-2xl border bg-slate-50/80 p-3 text-sm">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-[11px] font-bold text-emerald-700">
                      {(gh.name ?? "G").split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium leading-tight text-slate-900">{gh.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{gh.owner_name}</p>
                    </div>
                    <div className="text-right">
                      <Badge className={gh.is_active ? "border-0 bg-green-100 text-green-700" : "border-0 bg-red-100 text-red-700"}>
                        {gh.device_count} devices
                      </Badge>
                      <p className="mt-1 text-[11px] text-muted-foreground">{gh.created_at ? formatDate(gh.created_at) : "—"}</p>
                    </div>
                  </div>
                ))}
                {recentGreenhouses.length === 0 && <p className="text-sm text-muted-foreground">No greenhouses found.</p>}
              </div>
            </Card>

            <Card className="border shadow-none">
              <div className="border-b px-5 py-4">
                <p className="text-sm font-semibold text-slate-900">Recent Flower Shops</p>
                <p className="text-xs text-muted-foreground">Latest florist-side locations added to the platform.</p>
              </div>
              <div className="space-y-3 p-4">
                {recentFlowerShops.map((shop) => (
                  <div key={shop._id} className="flex items-center gap-3 rounded-2xl border bg-slate-50/80 p-3 text-sm">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-fuchsia-100 text-[11px] font-bold text-fuchsia-700">
                      {(shop.name ?? "F").split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium leading-tight text-slate-900">{shop.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{shop.owner_name}</p>
                    </div>
                    <div className="text-right">
                      <Badge className={shop.is_active ? "border-0 bg-green-100 text-green-700" : "border-0 bg-red-100 text-red-700"}>
                        {shop.device_count} devices
                      </Badge>
                      <p className="mt-1 text-[11px] text-muted-foreground">{shop.created_at ? formatDate(shop.created_at) : "—"}</p>
                    </div>
                  </div>
                ))}
                {recentFlowerShops.length === 0 && <p className="text-sm text-muted-foreground">No flower shops found.</p>}
              </div>
            </Card>

            <Card className="border shadow-none">
              <div className="border-b px-5 py-4">
                <p className="text-sm font-semibold text-slate-900">Recent Devices</p>
                <p className="text-xs text-muted-foreground">Newest devices registered across all locations.</p>
              </div>
              <div className="space-y-3 p-4">
                {recentDevices.map((device) => (
                  <div key={device._id} className="flex items-center gap-3 rounded-2xl border bg-slate-50/80 p-3 text-sm">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-100 text-[11px] font-bold uppercase text-violet-700">
                      {(device.type ?? "D").slice(0, 2)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium leading-tight text-slate-900">{device.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {device.location_name} · {device.user_name}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge className="border-0 bg-blue-100 text-blue-700">{device.type}</Badge>
                      <p className="mt-1 text-[11px] text-muted-foreground">{device.created_at ? formatDate(device.created_at) : "—"}</p>
                    </div>
                  </div>
                ))}
                {recentDevices.length === 0 && <p className="text-sm text-muted-foreground">No devices found.</p>}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
