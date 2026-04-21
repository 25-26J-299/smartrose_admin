import { useCallback, useEffect, useState } from "react"
import { createBaseStation, searchApprovedUsers, type SearchResult } from "@/lib/api"
import { Dialog } from "@/components/ui/Dialog"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { Loader2, Search, User } from "lucide-react"

interface AddBaseStationModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function AddBaseStationModal({ open, onClose, onSuccess }: AddBaseStationModalProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [selectedUser, setSelectedUser] = useState<SearchResult["user"] | null>(null)
  const [name, setName] = useState("")
  const [serial, setSerial] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const doSearch = useCallback(async (q: string) => {
    if (!q || q.length < 2) {
      setSearchResults([])
      return
    }
    setSearching(true)
    setError(null)
    try {
      const results = await searchApprovedUsers(q)
      setSearchResults(results)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Search failed")
    } finally {
      setSearching(false)
    }
  }, [])

  useEffect(() => {
    const t = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        void doSearch(searchQuery.trim())
      } else {
        setSearchResults([])
      }
    }, 300)
    return () => clearTimeout(t)
  }, [searchQuery, doSearch])

  const handleClose = () => {
    setSearchQuery("")
    setSearchResults([])
    setSelectedUser(null)
    setName("")
    setSerial("")
    setError(null)
    onClose()
  }

  const handleSubmit = async () => {
    if (!selectedUser) {
      setError("Please select an owner")
      return
    }
    if (!name.trim()) {
      setError("Please enter base station name")
      return
    }
    if (!serial.trim()) {
      setError("Please enter base station serial")
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await createBaseStation({
        user_id: selectedUser._id,
        name: name.trim(),
        serial: serial.trim(),
      })
      onSuccess()
      handleClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create base station")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} title="Add Base Station" className="max-w-xl">
      <div className="space-y-2">
        <Label>Search approved user (name, email, phone)</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="e.g. john@email.com or +9477..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {searching && (
        <div className="flex items-center gap-2 py-2 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          Searching...
        </div>
      )}

      {searchResults.length > 0 && !selectedUser && (
        <div className="border rounded-lg max-h-52 overflow-y-auto">
          {searchResults.map((item) => (
            <button
              key={item.user._id}
              type="button"
              onClick={() => setSelectedUser(item.user)}
              className="w-full text-left p-3 border-b last:border-b-0 hover:bg-muted/40"
            >
              <div className="flex items-center gap-2 text-sm font-medium">
                <User className="w-4 h-4" />
                {item.user.full_name} · {item.user.email}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {item.user.phone ? item.user.phone : "No phone"}
              </p>
            </button>
          ))}
        </div>
      )}

      {selectedUser && (
        <div className="rounded-lg border p-4 bg-muted/30 space-y-2">
          <p className="text-sm font-medium">
            Owner: {selectedUser.full_name} · {selectedUser.email}
          </p>
          <Button variant="ghost" size="sm" onClick={() => setSelectedUser(null)}>
            Change selection
          </Button>
        </div>
      )}

      {selectedUser && (
        <div className="space-y-4 pt-4 border-t">
          <div>
            <Label>Base Station Name</Label>
            <Input
              placeholder="e.g. Main Base Station"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label>Serial Number</Label>
            <Input
              placeholder="e.g. BS-2024-001"
              value={serial}
              onChange={(e) => setSerial(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={handleClose}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!selectedUser || !name.trim() || !serial.trim() || submitting}
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add Base Station"}
        </Button>
      </div>
    </Dialog>
  )
}
