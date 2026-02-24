import TopBar from "@/components/layout/TopBar"
import { Card } from "@/components/ui/Card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs"
import AreaChart from "@/components/charts/AreaChart"
import BarChart from "@/components/charts/BarChart"
import { mockSensorChartData, mockUserGrowthData, mockAlertData } from "@/lib/mock-data"

const mlBreakdownData = [
  { date: "INM", value: 1240 },
  { date: "EDAS", value: 860 },
  { date: "EOSM", value: 720 },
  { date: "FM", value: 820 },
]

const deviceTypeData = [
  { date: "Mon", value: 2100 },
  { date: "Tue", value: 2450 },
  { date: "Wed", value: 1980 },
  { date: "Thu", value: 3100 },
  { date: "Fri", value: 2800 },
  { date: "Sat", value: 1500 },
  { date: "Sun", value: 1200 },
]

const summaryRows = [
  { label: "Total Sensor Readings (7d)", value: "91,240", change: "+12%", positive: true },
  { label: "Total ML Predictions (7d)", value: "22,840", change: "+8%", positive: true },
  { label: "Average Alerts per Day", value: "10.4", change: "-15%", positive: true },
  { label: "Peak Reading Hour", value: "10:00 AM", change: "—", positive: true },
  { label: "Most Active Module", value: "INM", change: "—", positive: true },
  { label: "Most Alerts Module", value: "EDAS", change: "+5%", positive: false },
]

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar title="Analytics" subtitle="Platform-wide usage, predictions, and trends." />

      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        <Card className="border shadow-none overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <p className="text-sm font-semibold">Platform Summary (Last 7 Days)</p>
          </div>
          <div className="divide-y divide-border">
            {summaryRows.map(({ label, value, change, positive }) => (
              <div key={label} className="flex items-center justify-between px-5 py-3">
                <p className="text-sm text-muted-foreground">{label}</p>
                <div className="flex items-center gap-3">
                  <p className="text-sm font-semibold">{value}</p>
                  {change !== "—" && <span className={`text-xs font-medium ${positive ? "text-green-600" : "text-red-500"}`}>{change}</span>}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Tabs defaultValue="sensors">
          <TabsList className="mb-4">
            <TabsTrigger value="sensors">Sensor Readings</TabsTrigger>
            <TabsTrigger value="predictions">ML Predictions</TabsTrigger>
            <TabsTrigger value="users">User Growth</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
          </TabsList>

          <TabsContent value="sensors">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="p-5 border shadow-none">
                <p className="text-sm font-semibold mb-1">Daily Sensor Readings (7d)</p>
                <p className="text-xs text-muted-foreground mb-4">Total readings ingested per day</p>
                <AreaChart data={mockSensorChartData} color="#22c55e" label="Readings" height={220} />
              </Card>
              <Card className="p-5 border shadow-none">
                <p className="text-sm font-semibold mb-1">Readings by Day of Week</p>
                <p className="text-xs text-muted-foreground mb-4">Average readings distribution</p>
                <BarChart data={deviceTypeData} color="#22c55e" label="Readings" height={220} />
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="predictions">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="p-5 border shadow-none">
                <p className="text-sm font-semibold mb-1">Predictions by ML Module (Today)</p>
                <p className="text-xs text-muted-foreground mb-4">Inference counts per module</p>
                <BarChart data={mlBreakdownData} color="#8b5cf6" label="Predictions" height={220} />
              </Card>
              <Card className="p-5 border shadow-none">
                <p className="text-sm font-semibold mb-1">Prediction Volume Trend (7d)</p>
                <p className="text-xs text-muted-foreground mb-4">Total predictions across all modules</p>
                <AreaChart data={mockSensorChartData.map((d) => ({ ...d, value: Math.round(d.value / 4) }))} color="#8b5cf6" label="Predictions" height={220} />
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users">
            <Card className="p-5 border shadow-none">
              <p className="text-sm font-semibold mb-1">User Growth Over Time</p>
              <p className="text-xs text-muted-foreground mb-4">Cumulative registered users per month</p>
              <AreaChart data={mockUserGrowthData} color="#3b82f6" label="Users" height={280} />
            </Card>
          </TabsContent>

          <TabsContent value="alerts">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="p-5 border shadow-none">
                <p className="text-sm font-semibold mb-1">Alerts per Day (7d)</p>
                <p className="text-xs text-muted-foreground mb-4">Total alerts triggered across all greenhouses</p>
                <BarChart data={mockAlertData} color="#f59e0b" label="Alerts" height={220} />
              </Card>
              <Card className="p-5 border shadow-none">
                <p className="text-sm font-semibold mb-1">Alert Trend</p>
                <p className="text-xs text-muted-foreground mb-4">Alert frequency over the last 7 days</p>
                <AreaChart data={mockAlertData} color="#ef4444" label="Alerts" height={220} />
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
