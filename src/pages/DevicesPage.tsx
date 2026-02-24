import TopBar from "@/components/layout/TopBar"
import { Card } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { mockDevices } from "@/lib/mock-data"
import { timeAgo } from "@/lib/utils"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table"
import { MoreHorizontal, Wifi, WifiOff, AlertTriangle } from "lucide-react"
import { DropdownMenu, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/DropdownMenu"
import type { DeviceType } from "@/types"

const deviceTypeColor: Record<DeviceType, string> = {
  INM: "bg-green-100 text-green-700",
  EOSM: "bg-blue-100 text-blue-700",
  EDAS: "bg-purple-100 text-purple-700",
  FM: "bg-amber-100 text-amber-700",
}

const deviceTypeDesc: Record<DeviceType, string> = {
  INM: "Nutrient Management",
  EOSM: "Stress Monitoring",
  EDAS: "Disease Alerting",
  FM: "Freshness Monitoring",
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
  const online = mockDevices.filter((d) => d.status === "online").length
  const offline = mockDevices.filter((d) => d.status === "offline").length
  const warning = mockDevices.filter((d) => d.status === "warning").length
  const byType = (["INM", "EOSM", "EDAS", "FM"] as const).map((t) => ({
    type: t,
    count: mockDevices.filter((d) => d.type === t).length,
  }))

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar title="Devices" subtitle="All IoT devices registered across greenhouses." />

      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="p-4 border shadow-none">
            <p className="text-xs text-muted-foreground font-medium">Total Devices</p>
            <p className="text-2xl font-bold mt-1">{mockDevices.length}</p>
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
            <Button size="sm" className="h-8 text-xs">+ Register Device</Button>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-xs">Device</TableHead>
                  <TableHead className="text-xs">Type</TableHead>
                  <TableHead className="text-xs">Greenhouse</TableHead>
                  <TableHead className="text-xs">Owner</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">Last Seen</TableHead>
                  <TableHead className="text-xs">Frequency</TableHead>
                  <TableHead className="text-xs">Firmware</TableHead>
                  <TableHead className="text-xs w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockDevices.map((device) => (
                  <TableRow key={device.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full shrink-0 ${device.status === "online" ? "bg-green-500" : device.status === "warning" ? "bg-amber-500" : "bg-red-500"}`} />
                        <p className="text-sm font-medium">{device.name}</p>
                      </div>
                      <p className="text-xs text-muted-foreground ml-4">{device.id}</p>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${deviceTypeColor[device.type]} border-0 text-xs`}>{device.type}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">{device.greenhouse_name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{device.owner_name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <StatusIcon status={device.status} />
                        <Badge className={`${statusBadgeClass(device.status)} border-0 text-xs`}>{device.status}</Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{device.last_seen ? timeAgo(device.last_seen) : "—"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{device.data_frequency_min ? `${device.data_frequency_min} min` : "—"}</TableCell>
                    <TableCell className="text-xs font-mono text-muted-foreground">{device.firmware_version ?? "—"}</TableCell>
                    <TableCell>
                      <DropdownMenu trigger={<Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="w-4 h-4" /></Button>}>
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>View Greenhouse</DropdownMenuItem>
                        <DropdownMenuItem>Regenerate API Key</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-500">Revoke & Remove</DropdownMenuItem>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  )
}
