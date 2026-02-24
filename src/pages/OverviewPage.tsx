import TopBar from "@/components/layout/TopBar"
import StatCard from "@/components/dashboard/StatCard"
import { Card } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Users, Warehouse, Cpu, Activity, AlertTriangle, TrendingUp, Wifi, WifiOff } from "lucide-react"
import { mockStats, mockSensorChartData, mockUserGrowthData, mockAlertData, mockDevices, mockUsers } from "@/lib/mock-data"
import AreaChart from "@/components/charts/AreaChart"
import BarChart from "@/components/charts/BarChart"

export default function OverviewPage() {
  const recentUsers = mockUsers.slice(0, 5)
  const criticalDevices = mockDevices.filter((d) => d.status !== "online").slice(0, 5)

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar title="Overview" subtitle="Welcome back, Super Admin — here's what's happening today." />

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Users" value={mockStats.total_users} subtitle={`${mockStats.active_users} active`} icon={Users} trend={{ value: 18, label: "vs last month" }} color="blue" />
          <StatCard title="Greenhouses" value={mockStats.total_greenhouses} subtitle={`${mockStats.active_greenhouses} active`} icon={Warehouse} trend={{ value: 7, label: "vs last month" }} color="green" />
          <StatCard title="Devices" value={mockStats.total_devices} subtitle={`${mockStats.online_devices} online`} icon={Cpu} trend={{ value: 3, label: "vs last month" }} color="purple" />
          <StatCard title="Alerts Today" value={mockStats.alerts_today} subtitle="Across all greenhouses" icon={AlertTriangle} trend={{ value: -20, label: "vs yesterday" }} color="amber" />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 border shadow-none">
            <p className="text-xs text-muted-foreground font-medium">Sensor Readings Today</p>
            <p className="text-2xl font-bold mt-1">{mockStats.total_sensor_readings_today.toLocaleString()}</p>
          </Card>
          <Card className="p-4 border shadow-none">
            <p className="text-xs text-muted-foreground font-medium">ML Predictions Today</p>
            <p className="text-2xl font-bold mt-1">{mockStats.total_ml_predictions_today.toLocaleString()}</p>
          </Card>
          <Card className="p-4 border shadow-none">
            <p className="text-xs text-muted-foreground font-medium">API Uptime</p>
            <p className="text-2xl font-bold mt-1 text-green-600">{mockStats.api_uptime_percent}%</p>
          </Card>
          <Card className="p-4 border shadow-none">
            <p className="text-xs text-muted-foreground font-medium">Offline Devices</p>
            <p className="text-2xl font-bold mt-1 text-red-500">{mockStats.total_devices - mockStats.online_devices}</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="p-5 border shadow-none lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-semibold">Sensor Readings (7 days)</p>
                <p className="text-xs text-muted-foreground">Total readings ingested per day</p>
              </div>
              <Activity className="w-4 h-4 text-muted-foreground" />
            </div>
            <AreaChart data={mockSensorChartData} color="#22c55e" label="Readings" height={200} />
          </Card>
          <Card className="p-5 border shadow-none">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-semibold">Alerts (7 days)</p>
                <p className="text-xs text-muted-foreground">System alerts triggered</p>
              </div>
              <AlertTriangle className="w-4 h-4 text-muted-foreground" />
            </div>
            <BarChart data={mockAlertData} color="#f59e0b" label="Alerts" height={200} />
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="p-5 border shadow-none">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-semibold">User Growth</p>
                <p className="text-xs text-muted-foreground">Total registered users per month</p>
              </div>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </div>
            <AreaChart data={mockUserGrowthData} color="#3b82f6" label="Users" height={160} />
          </Card>
          <div className="space-y-4">
            <Card className="p-5 border shadow-none">
              <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                <WifiOff className="w-4 h-4 text-red-500" />
                Devices Needing Attention
              </p>
              <div className="space-y-2">
                {criticalDevices.map((d) => (
                  <div key={d.id} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium leading-tight">{d.name}</p>
                      <p className="text-xs text-muted-foreground">{d.greenhouse_name}</p>
                    </div>
                    <Badge className={d.status === "offline" ? "bg-red-100 text-red-700 border-0" : "bg-amber-100 text-amber-700 border-0"}>
                      {d.status}
                    </Badge>
                  </div>
                ))}
                {criticalDevices.length === 0 && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <Wifi className="w-4 h-4" />
                    <span>All devices online</span>
                  </div>
                )}
              </div>
            </Card>
            <Card className="p-5 border shadow-none">
              <p className="text-sm font-semibold mb-3">Recent Users</p>
              <div className="space-y-2">
                {recentUsers.map((u) => (
                  <div key={u.id} className="flex items-center gap-3 text-sm">
                    <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center shrink-0">
                      <span className="text-[10px] font-bold text-accent-foreground">
                        {u.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate leading-tight">{u.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                    </div>
                    <Badge className={u.is_active ? "bg-green-100 text-green-700 border-0 text-[10px]" : "bg-red-100 text-red-700 border-0 text-[10px]"}>
                      {u.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
