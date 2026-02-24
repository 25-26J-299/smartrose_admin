import TopBar from "@/components/layout/TopBar"
import { Card } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { mockGreenhouses } from "@/lib/mock-data"
import { formatDate, timeAgo } from "@/lib/utils"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table"
import { MoreHorizontal, MapPin, Cpu, Users, CheckCircle2, XCircle } from "lucide-react"
import { DropdownMenu, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/DropdownMenu"

export default function GreenhousesPage() {
  const activeCount = mockGreenhouses.filter((g) => g.status === "active").length

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar title="Greenhouses" subtitle="All registered greenhouses across the platform." />

      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Greenhouses", value: mockGreenhouses.length, color: "text-foreground" },
            { label: "Active", value: activeCount, color: "text-green-600" },
            { label: "Inactive", value: mockGreenhouses.length - activeCount, color: "text-red-500" },
            { label: "Total Devices", value: mockGreenhouses.reduce((a, g) => a + g.device_count, 0), color: "text-blue-600" },
          ].map(({ label, value, color }) => (
            <Card key={label} className="p-4 border shadow-none">
              <p className="text-xs text-muted-foreground font-medium">{label}</p>
              <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {mockGreenhouses.map((gh) => (
            <Card key={gh.id} className="p-5 border shadow-none flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-sm leading-tight">{gh.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{gh.owner_name}</p>
                </div>
                <Badge className={gh.status === "active" ? "bg-green-100 text-green-700 border-0 text-[10px]" : "bg-red-100 text-red-700 border-0 text-[10px]"}>
                  {gh.status === "active" ? <CheckCircle2 className="w-2.5 h-2.5 mr-1 inline" /> : <XCircle className="w-2.5 h-2.5 mr-1 inline" />}
                  {gh.status}
                </Badge>
              </div>
              {gh.location?.address && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5" />
                  {gh.location.address}
                </div>
              )}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-muted rounded-lg py-2">
                  <div className="flex items-center justify-center gap-1 text-xs font-semibold">
                    <Cpu className="w-3 h-3" />
                    {gh.device_count}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Devices</p>
                </div>
                <div className="bg-muted rounded-lg py-2">
                  <div className="flex items-center justify-center gap-1 text-xs font-semibold">
                    <Users className="w-3 h-3" />
                    {gh.member_count}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Members</p>
                </div>
                <div className="bg-muted rounded-lg py-2">
                  <div className="text-xs font-semibold capitalize">{gh.type.replace("_", " ").split(" ")[0]}</div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Type</p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-border">
                <p className="text-[10px] text-muted-foreground">Last activity: {gh.last_activity ? timeAgo(gh.last_activity) : "—"}</p>
                <DropdownMenu trigger={<Button variant="ghost" size="icon" className="h-6 w-6"><MoreHorizontal className="w-3.5 h-3.5" /></Button>}>
                  <DropdownMenuItem>View Details</DropdownMenuItem>
                  <DropdownMenuItem>View Devices</DropdownMenuItem>
                  <DropdownMenuItem>View Owner</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {gh.status === "active" ? <DropdownMenuItem className="text-red-500">Deactivate</DropdownMenuItem> : <DropdownMenuItem className="text-green-600">Activate</DropdownMenuItem>}
                </DropdownMenu>
              </div>
            </Card>
          ))}
        </div>

        <Card className="border shadow-none overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <p className="text-sm font-semibold">Greenhouse Table</p>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-xs">Name</TableHead>
                  <TableHead className="text-xs">Owner</TableHead>
                  <TableHead className="text-xs">Location</TableHead>
                  <TableHead className="text-xs">Devices</TableHead>
                  <TableHead className="text-xs">Members</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">Created</TableHead>
                  <TableHead className="text-xs w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockGreenhouses.map((gh) => (
                  <TableRow key={gh.id}>
                    <TableCell className="text-sm font-medium">{gh.name}</TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{gh.owner_name}</p>
                        <p className="text-xs text-muted-foreground">{gh.owner_email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{gh.location?.address ?? "—"}</TableCell>
                    <TableCell className="text-sm">{gh.device_count}</TableCell>
                    <TableCell className="text-sm">{gh.member_count}</TableCell>
                    <TableCell>
                      <Badge className={gh.status === "active" ? "bg-green-100 text-green-700 border-0 text-xs" : "bg-red-100 text-red-700 border-0 text-xs"}>{gh.status}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{formatDate(gh.created_at)}</TableCell>
                    <TableCell>
                      <DropdownMenu trigger={<Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="w-4 h-4" /></Button>}>
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>View Devices</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-500">Deactivate</DropdownMenuItem>
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
