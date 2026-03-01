import { useState, useEffect, useCallback } from "react"
import {
  searchApprovedUsers,
  createDevice,
  type SearchResult,
  type ApiLocation,
} from "@/lib/api"
import { Dialog } from "@/components/ui/Dialog"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { Search, Loader2, MapPin, User } from "lucide-react"

interface AddDeviceModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

const DEVICE_TYPES = [
  { value: "INM", label: "INM - Nutrient Management" },
  { value: "EOSM", label: "EOSM - Stress Monitoring" },
  { value: "EDAS", label: "EDAS - Disease Alerting" },
  { value: "FM", label: "FM - Freshness Monitoring" },
]

export function AddDeviceModal({
  open,
  onClose,
  onSuccess,
}: AddDeviceModalProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<{
    location: ApiLocation
    user: SearchResult["user"]
  } | null>(null)
  const [name, setName] = useState("")
  const [type, setType] = useState("INM")
  const [deviceSerialNumber, setDeviceSerialNumber] = useState("")
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
        doSearch(searchQuery.trim())
      } else {
        setSearchResults([])
      }
    }, 300)
    return () => clearTimeout(t)
  }, [searchQuery, doSearch])

  const handleSelectLocation = (item: SearchResult, loc: ApiLocation) => {
    setSelectedLocation({ location: loc, user: item.user })
  }

  const handleSubmit = async () => {
    if (!selectedLocation) {
      setError("Please select a user and location")
      return
    }
    if (!name.trim()) {
      setError("Please enter device name")
      return
    }
    if (!deviceSerialNumber.trim()) {
      setError("Please enter device serial number")
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await createDevice({
        location_id: selectedLocation.location._id,
        user_id: selectedLocation.user._id,
        name: name.trim(),
        type,
        device_serial_number: deviceSerialNumber.trim(),
      })
      onSuccess()
      handleClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create device")
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    setSearchQuery("")
    setSearchResults([])
    setSelectedLocation(null)
    setName("")
    setType("INM")
    setDeviceSerialNumber("")
    setError(null)
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} title="Add Device" className="max-w-xl">
      <div className="space-y-2">
        <Label>Search approved user (email, phone, or location name)</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="e.g. john@email.com, +9477..., or Farm Name"
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

      {searchResults.length > 0 && !selectedLocation && (
        <div className="border rounded-lg max-h-48 overflow-y-auto">
          {searchResults.map((item) => (
            <div key={item.user._id} className="p-3 border-b last:border-b-0">
              <div className="flex items-center gap-2 text-sm font-medium">
                <User className="w-4 h-4" />
                {item.user.full_name} · {item.user.email}
                {item.user.phone && ` · ${item.user.phone}`}
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                {item.locations.length === 0 ? (
                  <span>No locations</span>
                ) : (
                  item.locations.map((loc) => (
                    <button
                      key={loc._id}
                      type="button"
                      onClick={() => handleSelectLocation(item, loc)}
                      className="flex items-center gap-1.5 w-full text-left px-2 py-1.5 rounded hover:bg-muted"
                    >
                      <MapPin className="w-3 h-3" />
                      {loc.name} ({loc.type})
                    </button>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedLocation && (
        <div className="rounded-lg border p-4 bg-muted/30 space-y-2">
          <p className="text-sm font-medium">
            Selected: {selectedLocation.user.full_name} · {selectedLocation.location.name}
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedLocation(null)}
          >
            Change selection
          </Button>
        </div>
      )}

      {selectedLocation && (
        <div className="space-y-4 pt-4 border-t">
          <div>
            <Label>Device Name</Label>
            <Input
              placeholder="e.g. INM Sensor Unit 1"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label>Device Type</Label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {DEVICE_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>Device Serial Number</Label>
            <Input
              placeholder="e.g. SR-INM-2024-001"
              value={deviceSerialNumber}
              onChange={(e) => setDeviceSerialNumber(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={handleClose}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!selectedLocation || !name.trim() || !deviceSerialNumber.trim() || submitting}
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add Device"}
        </Button>
      </div>
    </Dialog>
  )
}
