import { useEffect, useState } from "react"
import TopBar from "@/components/layout/TopBar"
import { Card } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import {
  fetchDevices,
  type ApiDevice,
} from "@/lib/api"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table"
import { Loader2, AlertCircle, Plus, FileSearch } from "lucide-react"
import { AddDeviceModal } from "@/components/AddDeviceModal"
import { DeviceReviewModal } from "@/components/DeviceReviewModal"

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

export default function DevicesPage() {
  const [devices, setDevices] = useState<ApiDevice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [reviewDevice, setReviewDevice] = useState<ApiDevice | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")

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

  const byType = (["INM", "EOSM", "EDAS", "FM"] as const).map((t) => ({
    type: t,
    count: devices.filter((d) => d.type === t).length,
  }))
  const filteredDevices = devices.filter((device) => {
    const q = searchQuery.trim().toLowerCase()
    const matchesSearch =
      q.length === 0 ||
      device.name.toLowerCase().includes(q) ||
      device.device_serial_number.toLowerCase().includes(q) ||
      (device.location_name ?? "").toLowerCase().includes(q) ||
      (device.user_name ?? "").toLowerCase().includes(q) ||
      device.type.toLowerCase().includes(q)
    const matchesType = typeFilter === "all" || device.type === typeFilter
    return matchesSearch && matchesType
  })

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
        <div className="grid grid-cols-1 gap-4">
          <Card className="p-4 border shadow-none">
            <p className="text-xs text-muted-foreground font-medium">Total Devices</p>
            <p className="text-2xl font-bold mt-1">{devices.length}</p>
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
          <div className="px-5 py-4 border-b border-border flex flex-col md:flex-row gap-3 md:items-center">
            <Input
              placeholder="Search by device, serial, location, or owner..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="md:max-w-sm"
            />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm md:w-44"
            >
              <option value="all">All Types</option>
              <option value="INM">INM</option>
              <option value="EOSM">EOSM</option>
              <option value="EDAS">EDAS</option>
              <option value="FM">FM</option>
            </select>
            <Button
              variant="outline"
              size="sm"
              className="h-9"
              onClick={() => {
                setSearchQuery("")
                setTypeFilter("all")
              }}
            >
              Clear
            </Button>
            <p className="text-xs text-muted-foreground md:ml-auto">
              Showing {filteredDevices.length} of {devices.length}
            </p>
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
                  <TableHead className="text-xs w-32">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDevices.map((device) => {
                  const locName = device.location_name ?? ""
                  const userName = device.user_name ?? ""
                  return (
                    <TableRow key={device._id}>
                      <TableCell>
                        <p className="text-sm font-medium">{device.name}</p>
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
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 gap-1.5 px-3"
                          onClick={() => setReviewDevice(device)}
                          title="Review"
                        >
                          <FileSearch className="w-4 h-4" />
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
                {filteredDevices.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-8">
                      No devices match the current search/filter.
                    </TableCell>
                  </TableRow>
                )}
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
      <DeviceReviewModal
        device={reviewDevice}
        open={reviewDevice !== null}
        onClose={() => setReviewDevice(null)}
        onSuccess={refreshDevices}
      />
    </div>
  )
}
