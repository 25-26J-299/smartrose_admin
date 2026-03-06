import { useEffect, useState } from "react"
import TopBar from "@/components/layout/TopBar"
import { Card } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { fetchUsers, type ApiUser } from "@/lib/api"
import { formatDate } from "@/lib/utils"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table"
import { UserCheck, UserX, Warehouse, Loader2, AlertCircle, FileSearch } from "lucide-react"
import { UserReviewModal } from "@/components/UserReviewModal"
import { AddUserModal } from "@/components/AddUserModal"
import type { User, UserStatus } from "@/types"

function mapApiUserToUser(api: ApiUser): User {
  const created = typeof api.created_at === "string" ? api.created_at : (api.created_at as { $date?: string })?.$date ?? ""
  const lastLogin = api.last_login ? (typeof api.last_login === "string" ? api.last_login : (api.last_login as { $date?: string })?.$date ?? "") : undefined
  return {
    id: api._id,
    name: api.full_name ?? api.email,
    email: api.email,
    role: (api.role ?? "farmer") as User["role"],
    status: (api.status ?? "pending") as UserStatus,
    is_active: api.is_active ?? true,
    subscription_tier: "basic",
    greenhouse_count: api.greenhouse_count ?? 0,
    created_at: created,
    last_login: lastLogin,
  }
}

const roleBadge = (role: string) => {
  const map: Record<string, string> = {
    farmer: "bg-green-100 text-green-700",
    florist: "bg-purple-100 text-purple-700",
    admin: "bg-blue-100 text-blue-700",
  }
  return map[role] ?? "bg-gray-100 text-gray-700"
}

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700",
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
  }
  return map[status] ?? "bg-gray-100 text-gray-700"
}

interface UsersPageProps {
  statusFilter?: "approved" | "pending"
}

export default function UsersPage({ statusFilter = "approved" }: UsersPageProps) {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reviewUserId, setReviewUserId] = useState<string | null>(null)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [accountFilter, setAccountFilter] = useState("all")
  const isPendingPage = statusFilter === "pending"

  const refreshUsers = () => {
    fetchUsers(statusFilter)
      .then((apiUsers) => setUsers(apiUsers.map(mapApiUserToUser)))
      .catch(() => setError("Failed to refresh"))
  }

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    fetchUsers(statusFilter)
      .then((apiUsers) => {
        if (!cancelled) {
          setUsers(apiUsers.map(mapApiUserToUser))
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load users")
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [statusFilter])

  const activeCount = users.filter((u) => u.is_active).length
  const inactiveCount = users.length - activeCount
  const roleOptions = Array.from(new Set(users.map((u) => u.role))).sort()
  const filteredUsers = users.filter((user) => {
    const q = searchQuery.trim().toLowerCase()
    const matchesSearch =
      q.length === 0 ||
      user.name.toLowerCase().includes(q) ||
      user.email.toLowerCase().includes(q) ||
      user.role.toLowerCase().includes(q)
    const matchesRole = roleFilter === "all" || user.role === roleFilter
    const matchesAccount =
      isPendingPage ||
      accountFilter === "all" ||
      (accountFilter === "active" && user.is_active) ||
      (accountFilter === "inactive" && !user.is_active)
    return matchesSearch && matchesRole && matchesAccount
  })

  if (loading) {
    return (
      <div className="flex flex-col h-full overflow-hidden">
        <TopBar title="Users" subtitle="Manage all registered users across the platform." />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  if (error) {
    const isSessionExpired = error.toLowerCase().includes("session expired") || error.toLowerCase().includes("not authenticated")
    return (
      <div className="flex flex-col h-full overflow-hidden">
        <TopBar title="Users" subtitle="Manage all registered users across the platform." />
        <div className="flex-1 flex flex-col items-center justify-center gap-3 p-6">
          <AlertCircle className="w-10 h-10 text-red-500" />
          <p className="text-sm text-muted-foreground text-center">{error}</p>
          {isSessionExpired ? (
            <Button onClick={() => { window.location.href = "/login" }}>Sign in again</Button>
          ) : (
            <Button onClick={() => window.location.reload()}>Retry</Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar
        title={isPendingPage ? "Pending Users" : "Users"}
        subtitle={isPendingPage ? "Users awaiting approval." : "Approved users across the platform."}
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        <div className={`grid gap-4 ${isPendingPage ? "grid-cols-1" : "grid-cols-2 sm:grid-cols-3"}`}>
          {[
            { label: isPendingPage ? "Total Pending Users" : "Total Users", value: users.length, color: "text-foreground" },
            ...(!isPendingPage
              ? [
                  { label: "Active", value: activeCount, color: "text-green-600" },
                  { label: "Inactive", value: inactiveCount, color: "text-red-500" },
                ]
              : []),
          ].map(({ label, value, color }) => (
            <Card key={label} className="p-4 border shadow-none">
              <p className="text-xs text-muted-foreground font-medium">{label}</p>
              <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
            </Card>
          ))}
        </div>

        <Card className="border shadow-none overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <p className="text-sm font-semibold">{isPendingPage ? "Pending Users" : "Approved Users"}</p>
            {!isPendingPage && (
              <Button size="sm" className="h-8 text-xs" onClick={() => setInviteOpen(true)}>
                + Invite User
              </Button>
            )}
          </div>
          <div className="px-5 py-4 border-b border-border flex flex-col md:flex-row gap-3 md:items-center">
            <Input
              placeholder={isPendingPage ? "Search pending users..." : "Search users..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="md:max-w-xs"
            />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm md:w-44"
            >
              <option value="all">All Roles</option>
              {roleOptions.map((role) => (
                <option key={role} value={role}>
                  {role[0].toUpperCase() + role.slice(1)}
                </option>
              ))}
            </select>
            {!isPendingPage && (
              <select
                value={accountFilter}
                onChange={(e) => setAccountFilter(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm md:w-44"
              >
                <option value="all">All Accounts</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            )}
            <Button
              variant="outline"
              size="sm"
              className="h-9"
              onClick={() => {
                setSearchQuery("")
                setRoleFilter("all")
                setAccountFilter("all")
              }}
            >
              Clear
            </Button>
            <p className="text-xs text-muted-foreground md:ml-auto">
              Showing {filteredUsers.length} of {users.length}
            </p>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-xs">User</TableHead>
                  <TableHead className="text-xs">Role</TableHead>
                  <TableHead className="text-xs">Greenhouses</TableHead>
                  {!isPendingPage && <TableHead className="text-xs">Status</TableHead>}
                  <TableHead className="text-xs">Approval</TableHead>
                  <TableHead className="text-xs">Joined</TableHead>
                  {!isPendingPage && <TableHead className="text-xs">Last Login</TableHead>}
                  <TableHead className="text-xs w-32">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center shrink-0">
                          <span className="text-[11px] font-bold text-accent-foreground">
                            {user.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium leading-tight">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${roleBadge(user.role)} border-0 text-xs capitalize`}>{user.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm">
                        <Warehouse className="w-3.5 h-3.5 text-muted-foreground" />
                        <span>{user.greenhouse_count}</span>
                      </div>
                    </TableCell>
                    {!isPendingPage && (
                      <TableCell>
                        {user.is_active ? (
                          <div className="flex items-center gap-1.5 text-green-600 text-xs font-medium">
                            <UserCheck className="w-3.5 h-3.5" />
                            Active
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-red-500 text-xs font-medium">
                            <UserX className="w-3.5 h-3.5" />
                            Inactive
                          </div>
                        )}
                      </TableCell>
                    )}
                    <TableCell>
                      <Badge className={`${statusBadge(user.status ?? "pending")} border-0 text-xs capitalize`}>
                        {user.status ?? "pending"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{formatDate(user.created_at)}</TableCell>
                    {!isPendingPage && (
                      <TableCell className="text-xs text-muted-foreground">
                        {user.last_login ? formatDate(user.last_login) : "—"}
                      </TableCell>
                    )}
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 gap-1.5 px-3"
                        onClick={() => setReviewUserId(user.id)}
                        title="Review"
                      >
                        <FileSearch className="w-4 h-4" />
                        Review
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={isPendingPage ? 6 : 8} className="text-center text-sm text-muted-foreground py-8">
                      No users match the current search/filter.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      <UserReviewModal
        userId={reviewUserId ?? ""}
        open={reviewUserId !== null}
        onClose={() => setReviewUserId(null)}
        onSuccess={refreshUsers}
        showAccountState={!isPendingPage}
        showDeleteAction={!isPendingPage}
      />
      <AddUserModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        onSuccess={() => {
          setInviteOpen(false)
          refreshUsers()
        }}
      />
    </div>
  )
}
