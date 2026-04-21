import { useEffect, useState } from "react"
import { Dialog } from "@/components/ui/Dialog"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { deleteBaseStation, updateBaseStation, type ApiBaseStation } from "@/lib/api"
import { Loader2, Edit2, Save, Trash2, X } from "lucide-react"

interface BaseStationReviewModalProps {
  baseStation: ApiBaseStation | null
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function BaseStationReviewModal({
  baseStation,
  open,
  onClose,
  onSuccess,
}: BaseStationReviewModalProps) {
  const [editMode, setEditMode] = useState(false)
  const [actioning, setActioning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({ name: "", serial: "" })

  useEffect(() => {
    if (!baseStation || !open) return
    setEditMode(false)
    setError(null)
    setForm({
      name: baseStation.name ?? "",
      serial: baseStation.serial ?? "",
    })
  }, [baseStation, open])

  if (!open || !baseStation) return null

  const handleSave = async () => {
    setActioning(true)
    setError(null)
    try {
      await updateBaseStation(baseStation._id, {
        name: form.name || undefined,
        serial: form.serial || undefined,
      })
      setEditMode(false)
      onSuccess()
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update base station")
    } finally {
      setActioning(false)
    }
  }

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Delete base station "${baseStation.name}" (${baseStation.serial})? This action cannot be undone.`
    )
    if (!confirmed) return
    setActioning(true)
    setError(null)
    try {
      await deleteBaseStation(baseStation._id)
      onSuccess()
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete base station")
    } finally {
      setActioning(false)
    }
  }

  const handleCancel = () => {
    setEditMode(false)
    setError(null)
    setForm({
      name: baseStation.name ?? "",
      serial: baseStation.serial ?? "",
    })
  }

  return (
    <Dialog open={open} onClose={onClose} title="Review Base Station">
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-2">Base Station Details</h3>
          {editMode ? (
            <div className="space-y-3">
              <div>
                <Label>Name</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Serial Number</Label>
                <Input
                  value={form.serial}
                  onChange={(e) => setForm((prev) => ({ ...prev, serial: e.target.value }))}
                  className="mt-1"
                />
              </div>
            </div>
          ) : (
            <div className="rounded-lg border p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name</span>
                <span className="font-medium">{baseStation.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Serial</span>
                <span className="font-mono text-xs">{baseStation.serial}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Owner</span>
                <span>{baseStation.user_name ?? "—"}</span>
              </div>
              {baseStation.last_seen && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last seen</span>
                  <span>{baseStation.last_seen}</span>
                </div>
              )}
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
