import { useEffect, useState } from "react"
import { Dialog } from "@/components/ui/Dialog"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { Badge } from "@/components/ui/Badge"
import { deleteDevice, updateDevice, type ApiDevice } from "@/lib/api"
import { Loader2, Edit2, Save, Trash2, X } from "lucide-react"

interface DeviceReviewModalProps {
  device: ApiDevice | null
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

const deviceTypeColor: Record<string, string> = {
  INM: "bg-green-100 text-green-700",
  EOSM: "bg-blue-100 text-blue-700",
  EDAS: "bg-purple-100 text-purple-700",
  FM: "bg-amber-100 text-amber-700",
}

export function DeviceReviewModal({
  device,
  open,
  onClose,
  onSuccess,
}: DeviceReviewModalProps) {
  const [editMode, setEditMode] = useState(false)
  const [actioning, setActioning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: "",
    type: "INM",
    device_serial_number: "",
  })

  useEffect(() => {
    if (!device || !open) return
    setEditMode(false)
    setError(null)
    setForm({
      name: device.name ?? "",
      type: device.type ?? "INM",
      device_serial_number: device.device_serial_number ?? "",
    })
  }, [device, open])

  if (!open || !device) return null

  const handleSave = async () => {
    setActioning(true)
    setError(null)
    try {
      await updateDevice(device._id, {
        name: form.name || undefined,
        type: form.type || undefined,
        device_serial_number: form.device_serial_number || undefined,
      })
      setEditMode(false)
      onSuccess()
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update device")
    } finally {
      setActioning(false)
    }
  }

  const handleDelete = async () => {
    const confirmed = window.confirm(`Delete device "${device.name}"? This action cannot be undone.`)
    if (!confirmed) return

    setActioning(true)
    setError(null)
    try {
      await deleteDevice(device._id)
      onSuccess()
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete device")
    } finally {
      setActioning(false)
    }
  }

  const handleCancel = () => {
    setEditMode(false)
    setError(null)
    setForm({
      name: device.name ?? "",
      type: device.type ?? "INM",
      device_serial_number: device.device_serial_number ?? "",
    })
  }

  return (
    <Dialog open={open} onClose={onClose} title="Review Device">
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-2">Device Details</h3>
          {editMode ? (
            <div className="space-y-3">
              <div>
                <Label>Device Name</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Device Type</Label>
                <select
                  value={form.type}
                  onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {DEVICE_TYPES.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Device Serial Number</Label>
                <Input
                  value={form.device_serial_number}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, device_serial_number: e.target.value }))
                  }
                  className="mt-1"
                />
              </div>
            </div>
          ) : (
            <div className="rounded-lg border p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name</span>
                <span className="font-medium">{device.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Type</span>
                <Badge className={`${deviceTypeColor[device.type] ?? "bg-gray-100 text-gray-700"} border-0`}>
                  {device.type}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Serial</span>
                <span className="font-mono text-xs">{device.device_serial_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Location</span>
                <span>{device.location_name || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Owner</span>
                <span>{device.user_name || "—"}</span>
              </div>
            </div>
          )}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex flex-wrap gap-2 pt-4 border-t">
          {editMode ? (
            <>
              <Button onClick={handleSave} disabled={actioning} className="gap-2">
                {actioning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save
              </Button>
              <Button variant="outline" onClick={handleCancel} disabled={actioning} className="gap-2">
                <X className="h-4 w-4" />
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setEditMode(true)} disabled={actioning} className="gap-2">
                <Edit2 className="h-4 w-4" />
                Edit
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={actioning} className="gap-2">
                {actioning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                Delete
              </Button>
            </>
          )}
        </div>
      </div>
    </Dialog>
  )
}
