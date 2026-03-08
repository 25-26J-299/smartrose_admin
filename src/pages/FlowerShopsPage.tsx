import { useEffect, useState } from "react"
import TopBar from "@/components/layout/TopBar"
import { Card } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import {
  fetchDevices,
  fetchLocations,
  fetchUsers,
  type ApiDevice,
  type ApiLocation,
  type ApiUser,
} from "@/lib/api"
import { formatDate } from "@/lib/utils"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table"
import { FileSearch, Loader2, AlertCircle, Plus } from "lucide-react"
import { FlowerShopReviewModal } from "@/components/FlowerShopReviewModal"
import { AddFlowerShopModal } from "@/components/AddFlowerShopModal"

interface FlowerShopRow extends ApiLocation {
  owner_name: string
  owner_email: string
  device_count: number
  is_active: boolean
}

export default function FlowerShopsPage() {
  const [shops, setShops] = useState<FlowerShopRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reviewShop, setReviewShop] = useState<FlowerShopRow | null>(null)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const buildRows = (
    locations: ApiLocation[],
    devices: ApiDevice[],
    users: ApiUser[]
  ): FlowerShopRow[] => {
    const shopLocations = locations.filter(
      (loc) => (loc.type ?? "").toLowerCase() === "flower_shop"
    )
    const usersById = new Map<string, ApiUser>(users.map((u) => [u._id, u]))
    const deviceCounts = new Map<string, number>()
    devices.forEach((d) => {
      deviceCounts.set(d.location_id, (deviceCounts.get(d.location_id) ?? 0) + 1)
    })
    return shopLocations.map((loc) => {
      const owner = usersById.get(loc.user_id)
      return {
        ...loc,
        owner_name: owner?.full_name ?? "—",
        owner_email: owner?.email ?? "—",
        device_count: deviceCounts.get(loc._id) ?? 0,
        is_active: loc.is_active ?? true,
      }
    })
  }

  const refreshShops = () => {
    Promise.all([fetchLocations(), fetchDevices(), fetchUsers()])
      .then(([locations, devices, users]) => setShops(buildRows(locations, devices, users)))
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to refresh"))
  }

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    Promise.all([fetchLocations(), fetchDevices(), fetchUsers()])
      .then(([locations, devices, users]) => {
        if (cancelled) return
        setShops(buildRows(locations, devices, users))
      })
      .catch((err) => {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Failed to load flower shops")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const activeCount = shops.filter((s) => s.is_active).length
  const inactiveCount = shops.length - activeCount

  const filteredShops = shops.filter((shop) => {
    const q = searchQuery.trim().toLowerCase()
    const matchesSearch =
      q.length === 0 ||
      (shop.name ?? "").toLowerCase().includes(q) ||
      (shop.owner_name ?? "").toLowerCase().includes(q) ||
      (shop.owner_email ?? "").toLowerCase().includes(q) ||
      (shop.address ?? "").toLowerCase().includes(q)
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && shop.is_active) ||
      (statusFilter === "inactive" && !shop.is_active)
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="flex flex-col h-full overflow-hidden">
        <TopBar
          title="Flower Shops"
          subtitle="All registered flower shops across the platform."
        />
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
        <TopBar
          title="Flower Shops"
          subtitle="All registered flower shops across the platform."
        />
        <div className="flex-1 flex flex-col items-center justify-center gap-3 p-6">
          <AlertCircle className="w-10 h-10 text-red-500" />
          <p className="text-sm text-muted-foreground text-center">{error}</p>
          {isSessionExpired ? (
            <Button onClick={() => { window.location.href = "/login" }}>Sign in again</Button>
          ) : (
            <Button onClick={refreshShops}>Retry</Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar
        title="Flower Shops"
        subtitle="All registered flower shops across the platform."
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Total Flower Shops", value: shops.length, color: "text-foreground" },
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
            <p className="text-sm font-semibold">Flower Shop Table</p>
            <Button size="sm" className="h-8 text-xs" onClick={() => setAddModalOpen(true)}>
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add Flower Shop
            </Button>
          </div>
          <div className="px-5 py-4 border-b border-border flex flex-col md:flex-row gap-3 md:items-center">
            <Input
              placeholder="Search by shop name, owner, email, or address..."
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
              Showing {filteredShops.length} of {shops.length}
            </p>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-xs">Shop Name</TableHead>
                  <TableHead className="text-xs">Owner</TableHead>
                  <TableHead className="text-xs">Address</TableHead>
                  <TableHead className="text-xs">Devices</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">Created</TableHead>
                  <TableHead className="text-xs w-32">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredShops.map((shop) => (
                  <TableRow key={shop._id}>
                    <TableCell className="text-sm font-medium">{shop.name}</TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{shop.owner_name}</p>
                        <p className="text-xs text-muted-foreground">{shop.owner_email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {shop.address ?? "—"}
                    </TableCell>
                    <TableCell className="text-sm">{shop.device_count}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          shop.is_active
                            ? "bg-purple-100 text-purple-700 border-0 text-xs"
                            : "bg-red-100 text-red-700 border-0 text-xs"
                        }
                      >
                        {shop.is_active ? "active" : "inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {shop.created_at ? formatDate(shop.created_at) : "—"}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 gap-1.5 px-3"
                        onClick={() => setReviewShop(shop)}
                        title="Review"
                      >
                        <FileSearch className="w-4 h-4" />
                        Review
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredShops.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center text-sm text-muted-foreground py-8"
                    >
                      No flower shops match the current search/filter.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      <FlowerShopReviewModal
        shop={reviewShop}
        open={reviewShop !== null}
        onClose={() => setReviewShop(null)}
        onSuccess={refreshShops}
      />
      <AddFlowerShopModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={refreshShops}
      />
    </div>
  )
}
