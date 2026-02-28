import { useEffect, useState } from "react"
import TopBar from "@/components/layout/TopBar"
import { Card } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import {
  fetchDevices,
  type ApiDevice,
} from "@/lib/api"
import { timeAgo } from "@/lib/utils"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table"
import { MoreHorizontal, Wifi, WifiOff, AlertTriangle, Loader2, AlertCircle, Plus, BarChart2 } from "lucide-react"
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/DropdownMenu"
import { AddDeviceModal } from "@/components/AddDeviceModal"
import { DeviceSensorDataModal } from "@/components/DeviceSensorDataModal"

const deviceTypeColor: Record<string, string> = {
  INM: "bg-green-100 text-green-700",
  EOSM: "bg-blue-100 text-blue-700",
  EDAS: "bg-purple-100 text-purple-700",
  FM: "bg-amber-100 text-amber-700",
}

const deviceTypeDesc: Record<string, string> = {
  INM: "Nutrient Management",
  EOSM: "Stress Monitoring",
  EDAS: "Disease Alerting",
  FM: "Freshness Monitoring",
}

function getStatus(device: ApiDevice): "online" | "offline" | "warning" {
  const lastSeen = device.last_seen
  if (!lastSeen) return "offline"
  try {
    const d = new Date(lastSeen)
    const diffMs = Date.now() - d.getTime()
    const diffMins = diffMs / 60000
    if (diffMins < 15) return "online"
    if (diffMins < 60) return "warning"
  } catch {
    // ignore
  }
  return "offline"
}

const StatusIcon = ({ status }: { status: string }) => {
  if (status === "online") return <Wifi className="w-3.5 h-3.5 text-green-600" />
  if (status === "warning") return <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
  return <WifiOff className="w-3.5 h-3.5 text-red-500" />
}

const statusBadgeClass = (status: string) => {
  if (status === "online") return "bg-green-100 text-green-700"
  if (status === "warning") return "bg-amber-100 text-amber-700"
  return "bg-red-100 text-red-700"
}

export default function DevicesPage() {
  const [devices, setDevices] = useState<ApiDevice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [sensorDataDeviceId, setSensorDataDeviceId] = useState<string | null>(null)

  const refreshDevices = () => {
    fetchDevices()
      .then(setDevices)
      .catch(() => setError("Failed to refresh"))
  }

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    fetchDevices()
      .then((d) => {
        if (!cancelled) setDevices(d)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  const online = devices.filter((d) => getStatus(d) === "online").length
  const offline = devices.filter((d) => getStatus(d) === "offline").length
  const warning = devices.filter((d) => getStatus(d) === "warning").length
  const byType = (["INM", "EOSM", "EDAS", "FM"] as const).map((t) => ({
    type: t,
    count: devices.filter((d) => d.type === t).length,
  }))

  if (loading) {
    return (
      <div className="flex flex-col h-full overflow-hidden">
        <TopBar title="Devices" subtitle="All IoT devices registered across locations." />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  if (error) {
    const isSessionExpired =
      error.toLowerCase().includes("session expired") ||
      error.toLowerCase().includes("not authenticated")
    return (
      <div className="flex flex-col h-full overflow-hidden">
        <TopBar title="Devices" subtitle="All IoT devices registered across locations." />
        <div className="flex-1 flex flex-col items-center justify-center gap-3 p-6">
          <AlertCircle className="w-10 h-10 text-red-500" />
          <p className="text-sm text-muted-foreground text-center">{error}</p>
          {isSessionExpired ? (
            <Button onClick={() => { window.location.href = "/login" }}>Sign in again</Button>
          ) : (
            <Button onClick={refreshDevices}>Retry</Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar title="Devices" subtitle="All IoT devices registered across locations." />

      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="p-4 border shadow-none">
            <p className="text-xs text-muted-foreground font-medium">Total Devices</p>
            <p className="text-2xl font-bold mt-1">{devices.length}</p>
          </Card>
          <Card className="p-4 border shadow-none">
            <p className="text-xs text-muted-foreground font-medium">Online</p>
            <p className="text-2xl font-bold mt-1 text-green-600">{online}</p>
          </Card>
          <Card className="p-4 border shadow-none">
            <p className="text-xs text-muted-foreground font-medium">Warning</p>
            <p className="text-2xl font-bold mt-1 text-amber-500">{warning}</p>
          </Card>
          <Card className="p-4 border shadow-none">
            <p className="text-xs text-muted-foreground font-medium">Offline</p>
            <p className="text-2xl font-bold mt-1 text-red-500">{offline}</p>
          </Card>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {byType.map(({ type, count }) => (
            <Card key={type} className="p-4 border shadow-none">
              <div className="flex items-center justify-between mb-2">
                <Badge className={`${deviceTypeColor[type]} border-0 text-xs`}>{type}</Badge>
                <span className="text-xl font-bold">{count}</span>
              </div>
              <p className="text-[10px] text-muted-foreground">{deviceTypeDesc[type]}</p>
            </Card>
          ))}
        </div>

        <Card className="border shadow-none overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <p className="text-sm font-semibold">Device Registry</p>
            <Button
              size="sm"
              className="h-8 text-xs"
              onClick={() => setAddModalOpen(true)}
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add Device
            </Button>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-xs">Device</TableHead>
                  <TableHead className="text-xs">Type</TableHead>
                  <TableHead className="text-xs">Location</TableHead>
                  <TableHead className="text-xs">Owner</TableHead>
                  <TableHead className="text-xs">Serial</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">Last Seen</TableHead>
                  <TableHead className="text-xs w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {devices.map((device) => {
                  const status = getStatus(device)
                  const locName = (device as ApiDevice & { location_name?: string }).location_name ?? ""
                  const userName = (device as ApiDevice & { user_name?: string }).user_name ?? ""
                  return (
                    <TableRow key={device._id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2 h-2 rounded-full shrink-0 ${
                              status === "online"
                                ? "bg-green-500"
                                : status === "warning"
                                  ? "bg-amber-500"
                                  : "bg-red-500"
                            }`}
                          />
                          <p className="text-sm font-medium">{device.name}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${deviceTypeColor[device.type]} border-0 text-xs`}>
                          {device.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{locName || "—"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{userName || "—"}</TableCell>
                      <TableCell className="text-xs font-mono">{device.device_serial_number}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <StatusIcon status={status} />
                          <Badge className={`${statusBadgeClass(status)} border-0 text-xs`}>
                            {status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {device.last_seen ? timeAgo(device.last_seen) : "—"}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu
                          trigger={
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          }
                        >
                          <DropdownMenuItem
                            onClick={() => setSensorDataDeviceId(device._id)}
                          >
                            <BarChart2 className="w-3.5 h-3.5 mr-2" />
                            View Sensor Data
                          </DropdownMenuItem>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
          {devices.length === 0 && (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No devices registered. Click &quot;Add Device&quot; to register one.
            </div>
          )}
        </Card>
      </div>

      <AddDeviceModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={refreshDevices}
      />

      <DeviceSensorDataModal
        deviceId={sensorDataDeviceId}
        open={sensorDataDeviceId !== null}
        onClose={() => setSensorDataDeviceId(null)}
      />
    </div>
  )
}
