import { useEffect, useMemo, useState } from "react"
import TopBar from "@/components/layout/TopBar"
import { Card } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { fetchApiHealth, fetchDbHealth, fetchDevices, fetchLocations, fetchUsers } from "@/lib/api"
import { CheckCircle2, XCircle, AlertCircle, Server, Database, Users, Warehouse, Cpu, Loader2 } from "lucide-react"

type ServiceStatus = "healthy" | "down"

interface ServiceRow {
  name: string
  status: ServiceStatus
  detail: string
}

const StatusIcon = ({ status }: { status: ServiceStatus }) =>
  status === "healthy" ? (
    <CheckCircle2 className="w-4 h-4 text-green-600" />
  ) : (
    <XCircle className="w-4 h-4 text-red-500" />
  )

const statusBadge = (status: ServiceStatus) =>
  status === "healthy" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"

export default function SystemPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [services, setServices] = useState<ServiceRow[]>([])
  const [counts, setCounts] = useState({
    users: 0,
    locations: 0,
    devices: 0,
  })
  const [lastChecked, setLastChecked] = useState<string>("")

  const refreshSystem = () => {
    setError(null)
    Promise.allSettled([
      fetchApiHealth(),
      fetchDbHealth(),
      fetchUsers(),
      fetchLocations(),
      fetchDevices(),
    ]).then((results) => {
      const [apiResult, dbResult, usersResult, locationsResult, devicesResult] = results

      const nextServices: ServiceRow[] = [
        {
          name: "API Gateway",
          status: apiResult.status === "fulfilled" && apiResult.value.status === "ok" ? "healthy" : "down",
          detail:
            apiResult.status === "fulfilled"
              ? apiResult.value.message ?? "API responding"
              : apiResult.reason instanceof Error
                ? apiResult.reason.message
                : "API unavailable",
        },
        {
          name: "MongoDB Database",
          status: dbResult.status === "fulfilled" && dbResult.value.status === "ok" ? "healthy" : "down",
          detail:
            dbResult.status === "fulfilled"
              ? "Database connection healthy"
              : dbResult.reason instanceof Error
                ? dbResult.reason.message
                : "Database unavailable",
        },
        {
          name: "Users Admin Endpoint",
          status: usersResult.status === "fulfilled" ? "healthy" : "down",
          detail:
            usersResult.status === "fulfilled"
              ? `${usersResult.value.length} users loaded`
              : usersResult.reason instanceof Error
                ? usersResult.reason.message
                : "Users endpoint unavailable",
        },
        {
          name: "Locations Admin Endpoint",
          status: locationsResult.status === "fulfilled" ? "healthy" : "down",
          detail:
            locationsResult.status === "fulfilled"
              ? `${locationsResult.value.length} locations loaded`
              : locationsResult.reason instanceof Error
                ? locationsResult.reason.message
                : "Locations endpoint unavailable",
        },
        {
          name: "Devices Admin Endpoint",
          status: devicesResult.status === "fulfilled" ? "healthy" : "down",
          detail:
            devicesResult.status === "fulfilled"
              ? `${devicesResult.value.length} devices loaded`
              : devicesResult.reason instanceof Error
                ? devicesResult.reason.message
                : "Devices endpoint unavailable",
        },
      ]

      setServices(nextServices)
      setCounts({
        users: usersResult.status === "fulfilled" ? usersResult.value.length : 0,
        locations: locationsResult.status === "fulfilled" ? locationsResult.value.length : 0,
        devices: devicesResult.status === "fulfilled" ? devicesResult.value.length : 0,
      })
      setLastChecked(new Date().toLocaleString())
    }).catch((e) => {
      setError(e instanceof Error ? e.message : "Failed to refresh system health")
    })
  }

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    Promise.allSettled([
      fetchApiHealth(),
      fetchDbHealth(),
      fetchUsers(),
      fetchLocations(),
      fetchDevices(),
    ]).then((results) => {
      if (cancelled) return
      const [apiResult, dbResult, usersResult, locationsResult, devicesResult] = results

      const nextServices: ServiceRow[] = [
        {
          name: "API Gateway",
          status: apiResult.status === "fulfilled" && apiResult.value.status === "ok" ? "healthy" : "down",
          detail:
            apiResult.status === "fulfilled"
              ? apiResult.value.message ?? "API responding"
              : apiResult.reason instanceof Error
                ? apiResult.reason.message
                : "API unavailable",
        },
        {
          name: "MongoDB Database",
          status: dbResult.status === "fulfilled" && dbResult.value.status === "ok" ? "healthy" : "down",
          detail:
            dbResult.status === "fulfilled"
              ? "Database connection healthy"
              : dbResult.reason instanceof Error
                ? dbResult.reason.message
                : "Database unavailable",
        },
        {
          name: "Users Admin Endpoint",
          status: usersResult.status === "fulfilled" ? "healthy" : "down",
          detail:
            usersResult.status === "fulfilled"
              ? `${usersResult.value.length} users loaded`
              : usersResult.reason instanceof Error
                ? usersResult.reason.message
                : "Users endpoint unavailable",
        },
        {
          name: "Locations Admin Endpoint",
          status: locationsResult.status === "fulfilled" ? "healthy" : "down",
          detail:
            locationsResult.status === "fulfilled"
              ? `${locationsResult.value.length} locations loaded`
              : locationsResult.reason instanceof Error
                ? locationsResult.reason.message
                : "Locations endpoint unavailable",
        },
        {
          name: "Devices Admin Endpoint",
          status: devicesResult.status === "fulfilled" ? "healthy" : "down",
          detail:
            devicesResult.status === "fulfilled"
              ? `${devicesResult.value.length} devices loaded`
              : devicesResult.reason instanceof Error
                ? devicesResult.reason.message
                : "Devices endpoint unavailable",
        },
      ]

      setServices(nextServices)
      setCounts({
        users: usersResult.status === "fulfilled" ? usersResult.value.length : 0,
        locations: locationsResult.status === "fulfilled" ? locationsResult.value.length : 0,
        devices: devicesResult.status === "fulfilled" ? devicesResult.value.length : 0,
      })
      setLastChecked(new Date().toLocaleString())
    }).catch((err) => {
      if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load system health")
    }).finally(() => {
      if (!cancelled) setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const healthyCount = useMemo(() => services.filter((s) => s.status === "healthy").length, [services])
  const downCount = services.length - healthyCount

  if (loading) {
    return (
      <div className="flex flex-col h-full overflow-hidden">
        <TopBar title="System Health" subtitle="Current status of the admin-accessible backend services." />
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
        <TopBar title="System Health" subtitle="Current status of the admin-accessible backend services." />
        <div className="flex-1 flex flex-col items-center justify-center gap-3 p-6">
          <AlertCircle className="w-10 h-10 text-red-500" />
          <p className="text-sm text-muted-foreground text-center">{error}</p>
          {isSessionExpired ? (
            <Button onClick={() => { window.location.href = "/login" }}>Sign in again</Button>
          ) : (
            <Button onClick={refreshSystem}>Retry</Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar title="System Health" subtitle="Current status of the admin-accessible backend services." />

      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        <Card className={`p-4 border shadow-none flex items-center gap-4 ${downCount > 0 ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}`}>
          {downCount > 0 ? <XCircle className="w-8 h-8 text-red-500 shrink-0" /> : <CheckCircle2 className="w-8 h-8 text-green-600 shrink-0" />}
          <div>
            <p className={`font-semibold ${downCount > 0 ? "text-red-700" : "text-green-700"}`}>
              {downCount > 0 ? "Some services are unavailable" : "All checked services are operational"}
            </p>
            <p className="text-sm text-muted-foreground mt-0.5">
              {healthyCount} healthy · {downCount} down · Last checked: {lastChecked || "—"}
            </p>
          </div>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-4 border shadow-none">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="w-4 h-4" />
              <p className="text-xs font-medium">Users Loaded</p>
            </div>
            <p className="text-2xl font-bold mt-2">{counts.users}</p>
          </Card>
          <Card className="p-4 border shadow-none">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Warehouse className="w-4 h-4" />
              <p className="text-xs font-medium">Locations Loaded</p>
            </div>
            <p className="text-2xl font-bold mt-2">{counts.locations}</p>
          </Card>
          <Card className="p-4 border shadow-none">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Cpu className="w-4 h-4" />
              <p className="text-xs font-medium">Devices Loaded</p>
            </div>
            <p className="text-2xl font-bold mt-2">{counts.devices}</p>
          </Card>
        </div>

        <Card className="border shadow-none overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center gap-2">
            <Server className="w-4 h-4 text-muted-foreground" />
            <p className="text-sm font-semibold">Service Checks</p>
          </div>
          <div className="divide-y divide-border">
            {services.map((svc) => (
              <div key={svc.name} className="flex items-center justify-between px-5 py-3 gap-4">
                <div className="flex items-center gap-2.5 min-w-0">
                  <StatusIcon status={svc.status} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium leading-tight">{svc.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{svc.detail}</p>
                  </div>
                </div>
                <Badge className={`${statusBadge(svc.status)} border-0 text-xs capitalize`}>
                  {svc.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
