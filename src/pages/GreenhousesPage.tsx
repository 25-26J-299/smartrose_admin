import { useEffect, useState } from "react"
import TopBar from "@/components/layout/TopBar"
import { Card } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { fetchDevices, fetchLocations, fetchUsers, type ApiDevice, type ApiLocation, type ApiUser } from "@/lib/api"
import { formatDate } from "@/lib/utils"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table"
import { FileSearch, Loader2, AlertCircle, Plus } from "lucide-react"
import { GreenhouseReviewModal } from "@/components/GreenhouseReviewModal"
import { AddGreenhouseModal } from "@/components/AddGreenhouseModal"

interface GreenhouseRow extends ApiLocation {
  owner_name: string
  owner_email: string
  device_count: number
  is_active: boolean
}

export default function GreenhousesPage() {
  const [greenhouses, setGreenhouses] = useState<GreenhouseRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reviewGreenhouse, setReviewGreenhouse] = useState<GreenhouseRow | null>(null)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const refreshGreenhouses = () => {
    Promise.all([fetchLocations(), fetchDevices(), fetchUsers()])
      .then(([locations, devices, users]) => {
        const greenhouseLocations = locations.filter((loc) => (loc.type ?? "").toLowerCase() === "greenhouse")
        const usersById = new Map<string, ApiUser>(users.map((u) => [u._id, u]))
        const deviceCounts = new Map<string, number>()
        devices.forEach((d: ApiDevice) => {
          const key = d.location_id
          deviceCounts.set(key, (deviceCounts.get(key) ?? 0) + 1)
        })

        const rows: GreenhouseRow[] = greenhouseLocations.map((loc) => {
          const owner = usersById.get(loc.user_id)
          return {
            ...loc,
            owner_name: owner?.full_name ?? "—",
            owner_email: owner?.email ?? "—",
            device_count: deviceCounts.get(loc._id) ?? 0,
            is_active: loc.is_active ?? true,
          }
        })
        setGreenhouses(rows)
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to refresh"))
  }

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    Promise.all([fetchLocations(), fetchDevices(), fetchUsers()])
      .then(([locations, devices, users]) => {
        if (cancelled) return
        const greenhouseLocations = locations.filter((loc) => (loc.type ?? "").toLowerCase() === "greenhouse")
        const usersById = new Map<string, ApiUser>(users.map((u) => [u._id, u]))
        const deviceCounts = new Map<string, number>()
        devices.forEach((d: ApiDevice) => {
          const key = d.location_id
          deviceCounts.set(key, (deviceCounts.get(key) ?? 0) + 1)
        })

        const rows: GreenhouseRow[] = greenhouseLocations.map((loc) => {
          const owner = usersById.get(loc.user_id)
          return {
            ...loc,
            owner_name: owner?.full_name ?? "—",
            owner_email: owner?.email ?? "—",
            device_count: deviceCounts.get(loc._id) ?? 0,
            is_active: loc.is_active ?? true,
          }
        })
        setGreenhouses(rows)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load greenhouses")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const activeCount = greenhouses.filter((g) => g.is_active).length
  const inactiveCount = greenhouses.length - activeCount
  const filteredGreenhouses = greenhouses.filter((gh) => {
    const q = searchQuery.trim().toLowerCase()
    const matchesSearch =
      q.length === 0 ||
      (gh.name ?? "").toLowerCase().includes(q) ||
      (gh.owner_name ?? "").toLowerCase().includes(q) ||
      (gh.owner_email ?? "").toLowerCase().includes(q) ||
      (gh.address ?? "").toLowerCase().includes(q)
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && gh.is_active) ||
      (statusFilter === "inactive" && !gh.is_active)
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="flex flex-col h-full overflow-hidden">
        <TopBar title="Greenhouses" subtitle="All registered greenhouses across the platform." />
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
        <TopBar title="Greenhouses" subtitle="All registered greenhouses across the platform." />
        <div className="flex-1 flex flex-col items-center justify-center gap-3 p-6">
          <AlertCircle className="w-10 h-10 text-red-500" />
          <p className="text-sm text-muted-foreground text-center">{error}</p>
          {isSessionExpired ? (
            <Button onClick={() => { window.location.href = "/login" }}>Sign in again</Button>
          ) : (
            <Button onClick={refreshGreenhouses}>Retry</Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar title="Greenhouses" subtitle="All registered greenhouses across the platform." />

      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Total Greenhouses", value: greenhouses.length, color: "text-foreground" },
            { label: "Active", value: activeCount, color: "text-green-600" },
            { label: "Inactive", value: inactiveCount, color: "text-red-500" },
          ].map(({ label, value, color }) => (
            <Card key={label} className="p-4 border shadow-none">
              <p className="text-xs text-muted-foreground font-medium">{label}</p>
              <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
            </Card>
          ))}
        </div>

        <Card className="border shadow-none overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <p className="text-sm font-semibold">Greenhouse Table</p>
            <Button size="sm" className="h-8 text-xs" onClick={() => setAddModalOpen(true)}>
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add Greenhouse
            </Button>
          </div>
          <div className="px-5 py-4 border-b border-border flex flex-col md:flex-row gap-3 md:items-center">
            <Input
              placeholder="Search by greenhouse, owner, email, or address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="md:max-w-sm"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm md:w-44"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <Button
              variant="outline"
              size="sm"
              className="h-9"
              onClick={() => {
                setSearchQuery("")
                setStatusFilter("all")
              }}
            >
              Clear
            </Button>
            <p className="text-xs text-muted-foreground md:ml-auto">
              Showing {filteredGreenhouses.length} of {greenhouses.length}
            </p>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-xs">Name</TableHead>
                  <TableHead className="text-xs">Owner</TableHead>
                  <TableHead className="text-xs">Location</TableHead>
                  <TableHead className="text-xs">Devices</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">Created</TableHead>
                  <TableHead className="text-xs w-32">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGreenhouses.map((gh) => (
                  <TableRow key={gh._id}>
                    <TableCell className="text-sm font-medium">{gh.name}</TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{gh.owner_name}</p>
                        <p className="text-xs text-muted-foreground">{gh.owner_email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{gh.address ?? "—"}</TableCell>
                    <TableCell className="text-sm">{gh.device_count}</TableCell>
                    <TableCell>
                      <Badge className={gh.is_active ? "bg-green-100 text-green-700 border-0 text-xs" : "bg-red-100 text-red-700 border-0 text-xs"}>
                        {gh.is_active ? "active" : "inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{gh.created_at ? formatDate(gh.created_at) : "—"}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 gap-1.5 px-3"
                        onClick={() => setReviewGreenhouse(gh)}
                        title="Review"
                      >
                        <FileSearch className="w-4 h-4" />
                        Review
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredGreenhouses.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-8">
                      No greenhouses match the current search/filter.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      <GreenhouseReviewModal
        greenhouse={reviewGreenhouse}
        open={reviewGreenhouse !== null}
        onClose={() => setReviewGreenhouse(null)}
        onSuccess={refreshGreenhouses}
      />
      <AddGreenhouseModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={refreshGreenhouses}
      />
    </div>
  )
}
