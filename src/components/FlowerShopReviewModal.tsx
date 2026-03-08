import { useEffect, useState } from "react"
import { Dialog } from "@/components/ui/Dialog"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { Badge } from "@/components/ui/Badge"
import { deleteLocation, updateLocation, type ApiLocation } from "@/lib/api"
import { Loader2, Edit2, Save, Trash2, X } from "lucide-react"

interface FlowerShopWithMeta extends ApiLocation {
  owner_name: string
  owner_email: string
  device_count: number
  is_active: boolean
}

interface FlowerShopReviewModalProps {
  shop: FlowerShopWithMeta | null
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function FlowerShopReviewModal({
  shop,
  open,
  onClose,
  onSuccess,
}: FlowerShopReviewModalProps) {
  const [editMode, setEditMode] = useState(false)
  const [actioning, setActioning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: "",
    address: "",
    is_active: true,
  })

  useEffect(() => {
    if (!shop || !open) return
    setEditMode(false)
    setError(null)
    setForm({
      name: shop.name ?? "",
      address: shop.address ?? "",
      is_active: shop.is_active ?? true,
    })
  }, [shop, open])

  if (!open || !shop) return null

  const handleSave = async () => {
    setActioning(true)
    setError(null)
    try {
      await updateLocation(shop._id, {
        name: form.name || undefined,
        address: form.address || undefined,
        is_active: form.is_active,
      })
      setEditMode(false)
      onSuccess()
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update flower shop")
    } finally {
      setActioning(false)
    }
  }

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Delete flower shop "${shop.name}"? This action cannot be undone.`
    )
    if (!confirmed) return
    setActioning(true)
    setError(null)
    try {
      await deleteLocation(shop._id)
      onSuccess()
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete flower shop")
    } finally {
      setActioning(false)
    }
  }

  const handleCancel = () => {
    setEditMode(false)
    setError(null)
    setForm({
      name: shop.name ?? "",
      address: shop.address ?? "",
      is_active: shop.is_active ?? true,
    })
  }

  return (
    <Dialog open={open} onClose={onClose} title="Review Flower Shop">
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-2">
            Flower Shop Details
          </h3>
          {editMode ? (
            <div className="space-y-3">
              <div>
                <Label>Shop Name</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Address</Label>
                <Input
                  value={form.address}
                  onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>State</Label>
                <select
                  value={form.is_active ? "active" : "inactive"}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, is_active: e.target.value === "active" }))
                  }
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shop Name</span>
                <span className="font-medium">{shop.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Owner</span>
                <span>{shop.owner_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Owner Email</span>
                <span>{shop.owner_email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Address</span>
                <span>{shop.address || "—"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Status</span>
                <Badge
                  className={
                    shop.is_active
                      ? "bg-green-100 text-green-700 border-0"
                      : "bg-red-100 text-red-700 border-0"
                  }
                >
                  {shop.is_active ? "active" : "inactive"}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Devices</span>
                <span>{shop.device_count}</span>
              </div>
            </div>
          )}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex flex-wrap gap-2 pt-4 border-t">
          {editMode ? (
            <>
              <Button onClick={handleSave} disabled={actioning} className="gap-2">
                {actioning ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={actioning}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => setEditMode(true)}
                disabled={actioning}
                className="gap-2"
              >
                <Edit2 className="h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={actioning}
                className="gap-2"
              >
                {actioning ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Delete
              </Button>
            </>
          )}
        </div>
      </div>
    </Dialog>
  )
}
