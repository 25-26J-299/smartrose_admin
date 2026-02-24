import TopBar from "@/components/layout/TopBar"
import { Card } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Progress } from "@/components/ui/Progress"
import { CheckCircle2, XCircle, AlertTriangle, Server, Database } from "lucide-react"

const services = [
  { name: "API Gateway (FastAPI)", status: "healthy", latency: "42ms", uptime: "99.7%" },
  { name: "MongoDB Database", status: "healthy", latency: "8ms", uptime: "99.9%" },
  { name: "INM ML Service", status: "healthy", latency: "120ms", uptime: "99.5%" },
  { name: "EDAS ML Service", status: "healthy", latency: "95ms", uptime: "99.8%" },
  { name: "EOSM ML Service", status: "degraded", latency: "380ms", uptime: "97.2%" },
  { name: "FM ML Service", status: "healthy", latency: "110ms", uptime: "99.6%" },
  { name: "WebSocket (EDAS Live)", status: "healthy", latency: "5ms", uptime: "99.1%" },
]

const metrics = [
  { label: "CPU Usage", value: 34, unit: "%" },
  { label: "Memory Usage", value: 61, unit: "%" },
  { label: "Disk Usage", value: 45, unit: "%" },
  { label: "Network I/O", value: 28, unit: "% of limit" },
]

const dbStats = [
  { collection: "users", documents: "248", size: "0.8 MB" },
  { collection: "inm_sensor_data", documents: "142,500", size: "86 MB" },
  { collection: "edas_sensor_data", documents: "98,200", size: "52 MB" },
  { collection: "eosm_readings", documents: "67,800", size: "38 MB" },
  { collection: "freshness_sensor_data", documents: "45,100", size: "24 MB" },
  { collection: "inm_predictions", documents: "28,400", size: "12 MB" },
  { collection: "edas_predictions", documents: "19,600", size: "8 MB" },
  { collection: "fm_predictions", documents: "11,200", size: "4 MB" },
]

const StatusIcon = ({ status }: { status: string }) => {
  if (status === "healthy") return <CheckCircle2 className="w-4 h-4 text-green-600" />
  if (status === "degraded") return <AlertTriangle className="w-4 h-4 text-amber-500" />
  return <XCircle className="w-4 h-4 text-red-500" />
}

const statusBadge = (status: string) => {
  if (status === "healthy") return "bg-green-100 text-green-700"
  if (status === "degraded") return "bg-amber-100 text-amber-700"
  return "bg-red-100 text-red-700"
}

export default function SystemPage() {
  const healthyCount = services.filter((s) => s.status === "healthy").length
  const degradedCount = services.filter((s) => s.status === "degraded").length
  const downCount = services.filter((s) => s.status === "down").length

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar title="System Health" subtitle="Monitor backend services, infrastructure, and database stats." />

      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        <Card className={`p-4 border shadow-none flex items-center gap-4 ${downCount > 0 ? "border-red-200 bg-red-50" : degradedCount > 0 ? "border-amber-200 bg-amber-50" : "border-green-200 bg-green-50"}`}>
          {downCount > 0 ? <XCircle className="w-8 h-8 text-red-500 shrink-0" /> : degradedCount > 0 ? <AlertTriangle className="w-8 h-8 text-amber-500 shrink-0" /> : <CheckCircle2 className="w-8 h-8 text-green-600 shrink-0" />}
          <div>
            <p className={`font-semibold ${downCount > 0 ? "text-red-700" : degradedCount > 0 ? "text-amber-700" : "text-green-700"}`}>
              {downCount > 0 ? "System Outage Detected" : degradedCount > 0 ? "System Partially Degraded" : "All Systems Operational"}
            </p>
            <p className="text-sm text-muted-foreground mt-0.5">
              {healthyCount} healthy · {degradedCount} degraded · {downCount} down · Last checked: just now
            </p>
          </div>
        </Card>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map(({ label, value, unit }) => (
            <Card key={label} className="p-4 border shadow-none space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground">{label}</p>
                <span className="text-sm font-bold">{value}%</span>
              </div>
              <Progress value={value} className="h-2" />
              <p className="text-[10px] text-muted-foreground">{unit}</p>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="border shadow-none overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center gap-2">
              <Server className="w-4 h-4 text-muted-foreground" />
              <p className="text-sm font-semibold">Service Status</p>
            </div>
            <div className="divide-y divide-border">
              {services.map((svc) => (
                <div key={svc.name} className="flex items-center justify-between px-5 py-3">
                  <div className="flex items-center gap-2.5">
                    <StatusIcon status={svc.status} />
                    <div>
                      <p className="text-sm font-medium leading-tight">{svc.name}</p>
                      <p className="text-xs text-muted-foreground">Latency: {svc.latency}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{svc.uptime}</span>
                    <Badge className={`${statusBadge(svc.status)} border-0 text-xs capitalize`}>{svc.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="border shadow-none overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center gap-2">
              <Database className="w-4 h-4 text-muted-foreground" />
              <p className="text-sm font-semibold">MongoDB Collections</p>
            </div>
            <div className="divide-y divide-border">
              {dbStats.map((db) => (
                <div key={db.collection} className="flex items-center justify-between px-5 py-2.5">
                  <p className="text-sm font-mono text-muted-foreground">{db.collection}</p>
                  <div className="flex items-center gap-4 text-xs text-right">
                    <span className="font-medium">{db.documents}</span>
                    <span className="text-muted-foreground w-16">{db.size}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-5 py-3 border-t border-border bg-muted/30">
              <p className="text-xs text-muted-foreground">Total: ~452,000 documents · ~224 MB used</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
