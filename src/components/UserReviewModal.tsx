import { useEffect, useState } from "react"
import {
  fetchUserWithLocations,
  updateUser,
  updateLocation,
  updateUserStatus,
  type ApiUser,
  type ApiLocation,
} from "@/lib/api"
import { formatDate } from "@/lib/utils"
import { Dialog } from "@/components/ui/Dialog"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { Badge } from "@/components/ui/Badge"
import { UserCheck, UserX, Loader2, Edit2, Save, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface UserReviewModalProps {
  userId: string
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700",
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
  }
  return map[status] ?? "bg-gray-100 text-gray-700"
}

const roleBadge = (role: string) => {
  const map: Record<string, string> = {
    farmer: "bg-green-100 text-green-700",
    florist: "bg-purple-100 text-purple-700",
    admin: "bg-blue-100 text-blue-700",
  }
  return map[role] ?? "bg-gray-100 text-gray-700"
}

export function UserReviewModal({
  userId,
  open,
  onClose,
  onSuccess,
}: UserReviewModalProps) {
  const [user, setUser] = useState<ApiUser | null>(null)
  const [locations, setLocations] = useState<ApiLocation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actioning, setActioning] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editUser, setEditUser] = useState({ full_name: "", phone: "", role: "" })
  const [editLocations, setEditLocations] = useState<
    Record<string, { name: string; type: string; address: string }>
  >({})

  const loadData = () => {
    if (!userId || !open) return
    setLoading(true)
    setError(null)
    fetchUserWithLocations(userId)
      .then(({ user: u, locations: locs }) => {
        setUser(u)
        setLocations(locs)
        setEditUser({
          full_name: u.full_name ?? "",
          phone: u.phone ?? "",
          role: u.role ?? "farmer",
        })
        const locEdits: Record<string, { name: string; type: string; address: string }> = {}
        locs.forEach((l) => {
          locEdits[l._id] = {
            name: l.name ?? "",
            type: l.type ?? "greenhouse",
            address: l.address ?? "",
          }
        })
        setEditLocations(locEdits)
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (open && userId) loadData()
  }, [open, userId])

  const handleApprove = async () => {
    if (!user) return
    setActioning(true)
    try {
      await updateUserStatus(user._id, "approved")
      onSuccess()
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to approve")
    } finally {
      setActioning(false)
    }
  }

  const handleReject = async () => {
    if (!user) return
    setActioning(true)
    try {
      await updateUserStatus(user._id, "rejected")
      onSuccess()
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to reject")
    } finally {
      setActioning(false)
    }
  }

  const handleSaveEdit = async () => {
    if (!user) return
    setActioning(true)
    setError(null)
    try {
      await updateUser(user._id, {
        full_name: editUser.full_name || undefined,
        phone: editUser.phone || undefined,
        role: editUser.role || undefined,
      })
      for (const [locId, data] of Object.entries(editLocations)) {
        await updateLocation(locId, {
          name: data.name || undefined,
          type: data.type || undefined,
          address: data.address || undefined,
        })
      }
      loadData()
      setEditMode(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save")
    } finally {
      setActioning(false)
    }
  }

  const handleCancelEdit = () => {
    setEditMode(false)
    if (user) {
      setEditUser({
        full_name: user.full_name ?? "",
        phone: user.phone ?? "",
        role: user.role ?? "farmer",
      })
      const locEdits: Record<string, { name: string; type: string; address: string }> = {}
      locations.forEach((l) => {
        locEdits[l._id] = {
          name: l.name ?? "",
          type: l.type ?? "greenhouse",
          address: l.address ?? "",
        }
      })
      setEditLocations(locEdits)
    }
  }

  if (!open) return null

  return (
    <Dialog open={open} onClose={onClose} title="Review User">
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="py-4">
          <p className="text-sm text-red-600">{error}</p>
          <Button className="mt-4" variant="outline" onClick={loadData}>
            Retry
          </Button>
        </div>
      ) : user ? (
        <div className="space-y-6">
          {/* User details */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">
              User Details
            </h3>
            {editMode ? (
              <div className="space-y-3">
                <div>
                  <Label>Full Name</Label>
                  <Input
                    value={editUser.full_name}
                    onChange={(e) =>
                      setEditUser((p) => ({ ...p, full_name: e.target.value }))
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input value={user.email} disabled className="mt-1 bg-muted" />
                  <p className="text-xs text-muted-foreground mt-1">
                    Email cannot be changed
                  </p>
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input
                    value={editUser.phone}
                    onChange={(e) =>
                      setEditUser((p) => ({ ...p, phone: e.target.value }))
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Role</Label>
                  <select
                    value={editUser.role}
                    onChange={(e) =>
                      setEditUser((p) => ({ ...p, role: e.target.value }))
                    }
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="farmer">Farmer</option>
                    <option value="florist">Florist</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name</span>
                  <span className="font-medium">{user.full_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email</span>
                  <span>{user.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phone</span>
                  <span>{user.phone || "—"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Role</span>
                  <Badge className={cn(roleBadge(user.role), "border-0")}>
                    {user.role}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Status</span>
                  <Badge className={cn(statusBadge(user.status), "border-0")}>
                    {user.status}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Joined</span>
                  <span>{formatDate(user.created_at)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Location details */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">
              Location Details
            </h3>
            {locations.length === 0 ? (
              <p className="text-sm text-muted-foreground">No locations</p>
            ) : (
              <div className="space-y-3">
                {locations.map((loc) =>
                  editMode ? (
                    <div
                      key={loc._id}
                      className="rounded-lg border p-4 space-y-3"
                    >
                      <div>
                        <Label>Location Name</Label>
                        <Input
                          value={editLocations[loc._id]?.name ?? ""}
                          onChange={(e) =>
                            setEditLocations((p) => ({
                              ...p,
                              [loc._id]: {
                                ...(p[loc._id] ?? {
                                  name: "",
                                  type: "greenhouse",
                                  address: "",
                                }),
                                name: e.target.value,
                              },
                            }))
                          }
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Type</Label>
                        <select
                          value={editLocations[loc._id]?.type ?? "greenhouse"}
                          onChange={(e) =>
                            setEditLocations((p) => ({
                              ...p,
                              [loc._id]: {
                                ...(p[loc._id] ?? {
                                  name: "",
                                  type: "greenhouse",
                                  address: "",
                                }),
                                type: e.target.value,
                              },
                            }))
                          }
                          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                          <option value="greenhouse">Greenhouse</option>
                          <option value="flower_shop">Flower Shop</option>
                        </select>
                      </div>
                      <div>
                        <Label>Address</Label>
                        <Input
                          value={editLocations[loc._id]?.address ?? ""}
                          onChange={(e) =>
                            setEditLocations((p) => ({
                              ...p,
                              [loc._id]: {
                                ...(p[loc._id] ?? {
                                  name: "",
                                  type: "greenhouse",
                                  address: "",
                                }),
                                address: e.target.value,
                              },
                            }))
                          }
                          className="mt-1"
                        />
                      </div>
                    </div>
                  ) : (
                    <div
                      key={loc._id}
                      className="rounded-lg border p-4 space-y-2 text-sm"
                    >
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Name</span>
                        <span className="font-medium">{loc.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Type</span>
                        <span className="capitalize">
                          {loc.type?.replace("_", " ") ?? "—"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Address</span>
                        <span className="text-right max-w-[200px] truncate">
                          {loc.address || "—"}
                        </span>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-4 border-t">
            {editMode ? (
              <>
                <Button
                  onClick={handleSaveEdit}
                  disabled={actioning}
                  className="gap-2"
                >
                  {actioning ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancelEdit}
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
                  className="gap-2"
                >
                  <Edit2 className="h-4 w-4" />
                  Edit
                </Button>
                {user.status === "pending" && (
                  <>
                    <Button
                      onClick={handleApprove}
                      disabled={actioning}
                      className="gap-2 bg-green-600 hover:bg-green-700"
                    >
                      {actioning ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <UserCheck className="h-4 w-4" />
                      )}
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleReject}
                      disabled={actioning}
                      className="gap-2"
                    >
                      {actioning ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <UserX className="h-4 w-4" />
                      )}
                      Reject
                    </Button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      ) : null}
    </Dialog>
  )
}
