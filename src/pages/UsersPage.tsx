import { useEffect, useState } from "react"
import TopBar from "@/components/layout/TopBar"
import { Card } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { fetchUsers, type ApiUser } from "@/lib/api"
import { formatDate } from "@/lib/utils"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table"
import { UserCheck, UserX, Warehouse, MoreHorizontal, Loader2, AlertCircle } from "lucide-react"
import { DropdownMenu, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/DropdownMenu"
import type { User } from "@/types"

function mapApiUserToUser(api: ApiUser): User {
  const roles = api.roles ?? []
  const primaryRole = roles[0] ?? "farmer"
  const created = typeof api.created_at === "string" ? api.created_at : (api.created_at as { $date?: string })?.$date ?? ""
  return {
    id: api._id,
    name: api.name,
    email: api.email,
    role: primaryRole as User["role"],
    is_active: true,
    subscription_tier: "basic",
    greenhouse_count: 0,
    created_at: created,
  }
}

const roleBadge = (role: string) => {
  const map: Record<string, string> = {
    farmer: "bg-green-100 text-green-700",
    florist: "bg-purple-100 text-purple-700",
    admin: "bg-blue-100 text-blue-700",
    superadmin: "bg-red-100 text-red-700",
  }
  return map[role] ?? "bg-gray-100 text-gray-700"
}

const tierBadge = (tier: string) => {
  const map: Record<string, string> = {
    basic: "bg-gray-100 text-gray-600",
    pro: "bg-blue-100 text-blue-700",
    enterprise: "bg-amber-100 text-amber-700",
  }
  return map[tier] ?? "bg-gray-100 text-gray-700"
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    fetchUsers()
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
  }, [])

  const activeCount = users.filter((u) => u.is_active).length
  const inactiveCount = users.length - activeCount

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
    return (
      <div className="flex flex-col h-full overflow-hidden">
        <TopBar title="Users" subtitle="Manage all registered users across the platform." />
        <div className="flex-1 flex flex-col items-center justify-center gap-3 p-6">
          <AlertCircle className="w-10 h-10 text-red-500" />
          <p className="text-sm text-muted-foreground text-center">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar title="Users" subtitle="Manage all registered users across the platform." />

      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Users", value: users.length, color: "text-foreground" },
            { label: "Active", value: activeCount, color: "text-green-600" },
            { label: "Inactive", value: inactiveCount, color: "text-red-500" },
            { label: "New This Month", value: "-", color: "text-blue-600" },
          ].map(({ label, value, color }) => (
            <Card key={label} className="p-4 border shadow-none">
              <p className="text-xs text-muted-foreground font-medium">{label}</p>
              <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
            </Card>
          ))}
        </div>

        <Card className="border shadow-none overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <p className="text-sm font-semibold">All Users</p>
            <Button size="sm" className="h-8 text-xs">+ Invite User</Button>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-xs">User</TableHead>
                  <TableHead className="text-xs">Role</TableHead>
                  <TableHead className="text-xs">Plan</TableHead>
                  <TableHead className="text-xs">Greenhouses</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">Joined</TableHead>
                  <TableHead className="text-xs">Last Login</TableHead>
                  <TableHead className="text-xs w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
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
                      <Badge className={`${tierBadge(user.subscription_tier)} border-0 text-xs capitalize`}>{user.subscription_tier}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm">
                        <Warehouse className="w-3.5 h-3.5 text-muted-foreground" />
                        <span>{user.greenhouse_count}</span>
                      </div>
                    </TableCell>
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
                    <TableCell className="text-xs text-muted-foreground">{formatDate(user.created_at)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{user.last_login ? formatDate(user.last_login) : "—"}</TableCell>
                    <TableCell>
                      <DropdownMenu
                        trigger={
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        }
                      >
                        <DropdownMenuItem>View Profile</DropdownMenuItem>
                        <DropdownMenuItem>View Greenhouses</DropdownMenuItem>
                        <DropdownMenuItem>Change Role</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {user.is_active ? (
                          <DropdownMenuItem className="text-red-500">Deactivate Account</DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem className="text-green-600">Activate Account</DropdownMenuItem>
                        )}
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  )
}
