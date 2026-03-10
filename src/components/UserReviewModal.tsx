import { useEffect, useState } from "react"
import {
  fetchUserWithLocations,
  updateUser,
  updateLocation,
  updateUserStatus,
  deleteUser,
  changeUserPassword,
  type ApiUser,
  type ApiLocation,
} from "@/lib/api"
import { formatDate } from "@/lib/utils"
import { Dialog } from "@/components/ui/Dialog"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { Badge } from "@/components/ui/Badge"
import { UserCheck, UserX, Loader2, Edit2, Save, X, Trash2, KeyRound } from "lucide-react"
import { cn } from "@/lib/utils"

interface UserReviewModalProps {
  userId: string
  open: boolean
  onClose: () => void
  onSuccess: () => void
  showAccountState?: boolean
  showDeleteAction?: boolean
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
  showAccountState = true,
  showDeleteAction = true,
}: UserReviewModalProps) {
  const [user, setUser] = useState<ApiUser | null>(null)
  const [locations, setLocations] = useState<ApiLocation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actioning, setActioning] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editUser, setEditUser] = useState({ full_name: "", phone: "", farmer: false, florist: false, is_active: true })
  const [editLocations, setEditLocations] = useState<
    Record<string, { name: string; type: string; address: string }>
  >({})

  // Change-password state
  const [showPasswordSection, setShowPasswordSection] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [passwordActioning, setPasswordActioning] = useState(false)

  const loadData = async () => {
    if (!userId || !open) return
    setLoading(true)
    setError(null)
    try {
      const { user: u, locations: locs } = await fetchUserWithLocations(userId)
      setUser(u)
      setLocations(locs)
      const userRoles = u.roles?.length ? u.roles : [u.role ?? "farmer"]
      setEditUser({
        full_name: u.full_name ?? "",
        phone: u.phone ?? "",
        farmer: userRoles.includes("farmer"),
        florist: userRoles.includes("florist"),
        is_active: u.is_active ?? true,
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
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open && userId) void loadData()
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
      const roles = [
        ...(editUser.farmer ? ["farmer"] : []),
        ...(editUser.florist ? ["florist"] : []),
      ]
      const updatedUser = await updateUser(user._id, {
        full_name: editUser.full_name || undefined,
        phone: editUser.phone || undefined,
        roles: roles.length > 0 ? roles : undefined,
        is_active: editUser.is_active,
      })
      await Promise.all(
        Object.entries(editLocations).map(([locId, data]) =>
          updateLocation(locId, {
          name: data.name || undefined,
          type: data.type || undefined,
          address: data.address || undefined,
          })
        )
      )
      setUser(updatedUser)
      setEditMode(false)
      onSuccess()
      void loadData()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save")
    } finally {
      setActioning(false)
    }
  }

  const handleCancelEdit = () => {
    setEditMode(false)
      if (user) {
        const userRoles = user.roles?.length ? user.roles : [user.role ?? "farmer"]
        setEditUser({
          full_name: user.full_name ?? "",
          phone: user.phone ?? "",
          farmer: userRoles.includes("farmer"),
          florist: userRoles.includes("florist"),
          is_active: user.is_active ?? true,
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

  const handleDelete = async () => {
    if (!user) return
    const confirmed = window.confirm(`Delete user "${user.full_name ?? user.email}"? This action cannot be undone.`)
    if (!confirmed) return

    setActioning(true)
    setError(null)
    try {
      await deleteUser(user._id)
      onSuccess()
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete user")
    } finally {
      setActioning(false)
    }
  }

  const handleChangePassword = async () => {
    setPasswordError(null)
    setPasswordSuccess(false)
    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters.")
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.")
      return
    }
    if (!user) return
    setPasswordActioning(true)
    try {
      await changeUserPassword(user._id, newPassword)
      setPasswordSuccess(true)
      setNewPassword("")
      setConfirmPassword("")
      setTimeout(() => setShowPasswordSection(false), 1500)
    } catch (e) {
      setPasswordError(e instanceof Error ? e.message : "Failed to change password")
    } finally {
      setPasswordActioning(false)
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
                  <Label>Role(s)</Label>
                  <p className="text-xs text-muted-foreground mb-2">Select one or both roles</p>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editUser.farmer}
                        onChange={(e) => setEditUser((p) => ({ ...p, farmer: e.target.checked }))}
                        className="w-4 h-4 rounded border-input accent-primary"
                      />
                      <span className="text-sm font-medium">Farmer</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editUser.florist}
                        onChange={(e) => setEditUser((p) => ({ ...p, florist: e.target.checked }))}
                        className="w-4 h-4 rounded border-input accent-primary"
                      />
                      <span className="text-sm font-medium">Florist</span>
                    </label>
                  </div>
                </div>
                {showAccountState && (
                  <div>
                    <Label>Account State</Label>
                    <select
                      value={editUser.is_active ? "active" : "inactive"}
                      onChange={(e) =>
                        setEditUser((p) => ({ ...p, is_active: e.target.value === "active" }))
                      }
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                )}
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
                  <span className="text-muted-foreground">Role(s)</span>
                  <div className="flex gap-1 flex-wrap justify-end">
                    {(user.roles?.length ? user.roles : [user.role]).map((r) => (
                      <Badge key={r} className={cn(roleBadge(r), "border-0 capitalize")}>
                        {r}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Status</span>
                  <Badge className={cn(statusBadge(user.status), "border-0")}>
                    {user.status}
                  </Badge>
                </div>
                {showAccountState && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Account State</span>
                    <Badge
                      className={cn(
                        user.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700",
                        "border-0"
                      )}
                    >
                      {user.is_active ? "active" : "inactive"}
                    </Badge>
                  </div>
                )}
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
                        <Label>Company Name</Label>
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

          {/* Change Password */}
          {showPasswordSection && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 space-y-3">
              <h3 className="text-sm font-semibold text-amber-800 flex items-center gap-2">
                <KeyRound className="h-4 w-4" />
                Set New Password
              </h3>
              <div>
                <Label>New Password</Label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); setPasswordError(null); setPasswordSuccess(false) }}
                  placeholder="Min. 6 characters"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Confirm Password</Label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setPasswordError(null); setPasswordSuccess(false) }}
                  placeholder="Repeat new password"
                  className="mt-1"
                />
              </div>
              {passwordError && (
                <p className="text-xs text-red-600">{passwordError}</p>
              )}
              {passwordSuccess && (
                <p className="text-xs text-green-700 font-medium">Password changed successfully.</p>
              )}
              <div className="flex gap-2">
                <Button
                  onClick={handleChangePassword}
                  disabled={passwordActioning}
                  className="gap-2 bg-amber-600 hover:bg-amber-700"
                >
                  {passwordActioning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Password
                </Button>
                <Button
                  variant="outline"
                  onClick={() => { setShowPasswordSection(false); setNewPassword(""); setConfirmPassword(""); setPasswordError(null); setPasswordSuccess(false) }}
                  disabled={passwordActioning}
                  className="gap-2"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
              </div>
            </div>
          )}

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
                  disabled={actioning}
                  className="gap-2"
                >
                  <Edit2 className="h-4 w-4" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  onClick={() => { setShowPasswordSection((v) => !v); setPasswordError(null); setPasswordSuccess(false) }}
                  disabled={actioning}
                  className="gap-2"
                >
                  <KeyRound className="h-4 w-4" />
                  {showPasswordSection ? "Hide Password" : "Change Password"}
                </Button>
                {showDeleteAction && (
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
                )}
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
