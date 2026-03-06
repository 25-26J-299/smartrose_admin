import { useState } from "react"
import { inviteUser } from "@/lib/api"
import { Dialog } from "@/components/ui/Dialog"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { Loader2 } from "lucide-react"

interface AddUserModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function AddUserModal({ open, onClose, onSuccess }: AddUserModalProps) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    role: "farmer" as "farmer" | "florist",
    location_name: "",
    location_type: "greenhouse" as "greenhouse" | "flower_shop",
    location_address: "",
  })

  const handleClose = () => {
    setSubmitting(false)
    setError(null)
    setForm({
      full_name: "",
      email: "",
      phone: "",
      password: "",
      role: "farmer",
      location_name: "",
      location_type: "greenhouse",
      location_address: "",
    })
    onClose()
  }

  const handleSubmit = async () => {
    if (!form.full_name.trim() || !form.email.trim() || !form.password.trim()) {
      setError("Name, email, and password are required")
      return
    }
    if (!form.location_name.trim() || !form.location_address.trim()) {
      setError("Location name and address are required")
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await inviteUser({
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        password: form.password,
        role: form.role,
        location: {
          name: form.location_name.trim(),
          type: form.location_type,
          address: form.location_address.trim(),
        },
      })
      onSuccess()
      handleClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to invite user")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} title="Invite User" className="max-w-xl">
      <div className="space-y-4">
        <div>
          <Label>Full Name</Label>
          <Input
            value={form.full_name}
            onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))}
            className="mt-1"
          />
        </div>
        <div>
          <Label>Email</Label>
          <Input
            type="email"
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            className="mt-1"
          />
        </div>
        <div>
          <Label>Phone (optional)</Label>
          <Input
            value={form.phone}
            onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
            className="mt-1"
          />
        </div>
        <div>
          <Label>Password</Label>
          <Input
            type="password"
            value={form.password}
            onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
            className="mt-1"
          />
        </div>
        <div>
          <Label>Role</Label>
          <select
            value={form.role}
            onChange={(e) => setForm((p) => ({ ...p, role: e.target.value as "farmer" | "florist" }))}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="farmer">Farmer</option>
            <option value="florist">Florist</option>
          </select>
        </div>
        <div className="pt-2 border-t">
          <p className="text-sm font-medium mb-3">Initial Location</p>
          <div className="space-y-3">
            <div>
              <Label>Location Name</Label>
              <Input
                value={form.location_name}
                onChange={(e) => setForm((p) => ({ ...p, location_name: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Location Type</Label>
              <select
                value={form.location_type}
                onChange={(e) => setForm((p) => ({ ...p, location_type: e.target.value as "greenhouse" | "flower_shop" }))}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="greenhouse">Greenhouse</option>
                <option value="flower_shop">Flower Shop</option>
              </select>
            </div>
            <div>
              <Label>Address</Label>
              <Input
                value={form.location_address}
                onChange={(e) => setForm((p) => ({ ...p, location_address: e.target.value }))}
                className="mt-1"
              />
            </div>
          </div>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Pending User"}
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
