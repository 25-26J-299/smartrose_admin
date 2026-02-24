import TopBar from "@/components/layout/TopBar"
import { Card } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { mockAuditLogs } from "@/lib/mock-data"
import { timeAgo } from "@/lib/utils"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table"
import { ScrollText, User, Warehouse, Cpu } from "lucide-react"

const actionColor = (action: string) => {
  if (action.includes("DELETE") || action.includes("REVOKE") || action.includes("DEACTIVATE")) return "bg-red-100 text-red-700"
  if (action.includes("CHANGE") || action.includes("UPDATE")) return "bg-amber-100 text-amber-700"
  if (action.includes("VIEW") || action.includes("LIST")) return "bg-gray-100 text-gray-600"
  return "bg-blue-100 text-blue-700"
}

const ResourceIcon = ({ type }: { type: string }) => {
  if (type === "user") return <User className="w-3.5 h-3.5" />
  if (type === "greenhouse") return <Warehouse className="w-3.5 h-3.5" />
  if (type === "device") return <Cpu className="w-3.5 h-3.5" />
  return <ScrollText className="w-3.5 h-3.5" />
}

export default function AuditLogsPage() {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar title="Audit Logs" subtitle="Track all admin actions and changes on the platform." />

      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        <Card className="p-4 border shadow-none bg-muted/40">
          <p className="text-sm text-muted-foreground">
            All admin actions are automatically logged for accountability and compliance. Logs are retained for 90 days.
          </p>
        </Card>

        <Card className="border shadow-none overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <p className="text-sm font-semibold">Recent Admin Actions</p>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-xs">Timestamp</TableHead>
                  <TableHead className="text-xs">Admin</TableHead>
                  <TableHead className="text-xs">Action</TableHead>
                  <TableHead className="text-xs">Resource</TableHead>
                  <TableHead className="text-xs">Details</TableHead>
                  <TableHead className="text-xs">IP Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockAuditLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{timeAgo(log.timestamp)}</TableCell>
                    <TableCell>
                      <p className="text-sm font-medium">{log.admin_name}</p>
                      <p className="text-xs text-muted-foreground">{log.admin_id}</p>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${actionColor(log.action)} border-0 text-xs font-mono`}>{log.action}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm">
                        <ResourceIcon type={log.resource_type} />
                        <span className="capitalize">{log.resource_type}</span>
                        <span className="text-muted-foreground font-mono text-xs">#{log.resource_id}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-48 truncate">{log.details ?? "—"}</TableCell>
                    <TableCell className="text-xs font-mono text-muted-foreground">{log.ip_address ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="px-5 py-3 border-t border-border bg-muted/30">
            <p className="text-xs text-muted-foreground">Showing {mockAuditLogs.length} most recent entries</p>
          </div>
        </Card>
      </div>
    </div>
  )
}
