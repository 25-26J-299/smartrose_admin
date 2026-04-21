import { useEffect, useState } from "react"
import TopBar from "@/components/layout/TopBar"
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import {
  fetchBaseStations,
  type ApiBaseStation,
} from "@/lib/api"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table"
import { Loader2, AlertCircle, Plus, FileSearch } from "lucide-react"
import { AddBaseStationModal } from "@/components/AddBaseStationModal"
import { BaseStationReviewModal } from "@/components/BaseStationReviewModal"

export default function BaseStationsPage() {
  const [baseStations, setBaseStations] = useState<ApiBaseStation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [reviewBaseStation, setReviewBaseStation] = useState<ApiBaseStation | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const refreshBaseStations = () => {
    fetchBaseStations()
      .then(setBaseStations)
      .catch(() => setError("Failed to refresh"))
  }

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    fetchBaseStations()
      .then((list) => {
        if (!cancelled) setBaseStations(list)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  const filteredBaseStations = baseStations.filter((bs) => {
    const q = searchQuery.trim().toLowerCase()
    if (q.length === 0) return true
    return (
      (bs.name ?? "").toLowerCase().includes(q) ||
      (bs.serial ?? "").toLowerCase().includes(q) ||
      (bs.user_name ?? "").toLowerCase().includes(q)
    )
  })

  if (loading) {
    return (
      <div className="flex flex-col h-full overflow-hidden">
        <TopBar title="Base Stations" subtitle="EOSM base stations for device connectivity." />
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
        <TopBar title="Base Stations" subtitle="EOSM base stations for device connectivity." />
        <div className="flex-1 flex flex-col items-center justify-center gap-3 p-6">
          <AlertCircle className="w-10 h-10 text-red-500" />
          <p className="text-sm text-muted-foreground text-center">{error}</p>
          {isSessionExpired ? (
            <Button onClick={() => { window.location.href = "/login" }}>Sign in again</Button>
          ) : (
            <Button onClick={refreshBaseStations}>Retry</Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar title="Base Stations" subtitle="EOSM base stations for device connectivity." />

      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        <div className="grid grid-cols-1 gap-4">
          <Card className="p-4 border shadow-none">
            <p className="text-xs text-muted-foreground font-medium">Total Base Stations</p>
            <p className="text-2xl font-bold mt-1">{baseStations.length}</p>
          </Card>
        </div>

        <Card className="border shadow-none overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <p className="text-sm font-semibold">Base Station Registry</p>
            <Button
              size="sm"
              className="h-8 text-xs"
              onClick={() => setAddModalOpen(true)}
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add Base Station
            </Button>
          </div>
          <div className="px-5 py-4 border-b border-border flex flex-col md:flex-row gap-3 md:items-center">
            <Input
              placeholder="Search by name, serial, or owner..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="md:max-w-sm"
            />
            <Button
              variant="outline"
              size="sm"
              className="h-9"
              onClick={() => setSearchQuery("")}
            >
              Clear
            </Button>
            <p className="text-xs text-muted-foreground md:ml-auto">
              Showing {filteredBaseStations.length} of {baseStations.length}
            </p>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-xs">Name</TableHead>
                  <TableHead className="text-xs">Serial</TableHead>
                  <TableHead className="text-xs">Owner</TableHead>
                  <TableHead className="text-xs w-32">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBaseStations.map((bs) => (
                  <TableRow key={bs._id}>
                    <TableCell className="text-sm font-medium">{bs.name}</TableCell>
                    <TableCell className="text-xs font-mono">{bs.serial}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{bs.user_name ?? "—"}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 gap-1.5 px-3"
                        onClick={() => setReviewBaseStation(bs)}
                        title="Review"
                      >
                        <FileSearch className="w-4 h-4" />
                        Review
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredBaseStations.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-sm text-muted-foreground py-8">
                      No base stations match the current search.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {baseStations.length === 0 && (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No base stations registered. Click &quot;Add Base Station&quot; to create one.
            </div>
          )}
        </Card>
      </div>

      <AddBaseStationModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={refreshBaseStations}
      />
      <BaseStationReviewModal
        baseStation={reviewBaseStation}
        open={reviewBaseStation !== null}
        onClose={() => setReviewBaseStation(null)}
        onSuccess={refreshBaseStations}
      />
    </div>
  )
}
