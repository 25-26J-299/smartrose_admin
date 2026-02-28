import { useEffect, useState } from "react"
import { fetchDeviceSensorData, type ApiDevice } from "@/lib/api"
import { formatDate } from "@/lib/utils"
import { Dialog } from "@/components/ui/Dialog"
import { Loader2, AlertCircle } from "lucide-react"

interface DeviceSensorDataModalProps {
  deviceId: string | null
  open: boolean
  onClose: () => void
}

export function DeviceSensorDataModal({
  deviceId,
  open,
  onClose,
}: DeviceSensorDataModalProps) {
  const [device, setDevice] = useState<ApiDevice | null>(null)
  const [readings, setReadings] = useState<unknown[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !deviceId) return
    setLoading(true)
    setError(null)
    fetchDeviceSensorData(deviceId, 50)
      .then(({ device: d, readings: r }) => {
        setDevice(d)
        setReadings(r)
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false))
  }, [open, deviceId])

  if (!open) return null

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Device Sensor Data"
      className="max-w-2xl max-h-[85vh]"
    >
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="py-4 flex items-center gap-2 text-red-600">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      ) : device ? (
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            {device.name} · {device.type} · {device.device_serial_number}
          </div>
          <div className="text-sm font-medium">
            {readings.length} reading{readings.length !== 1 ? "s" : ""} found
          </div>
          <div className="border rounded-lg overflow-x-auto max-h-64 overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="bg-muted sticky top-0">
                <tr>
                  <th className="text-left p-2">Timestamp</th>
                  <th className="text-left p-2">Air Temp</th>
                  <th className="text-left p-2">Water Temp</th>
                  <th className="text-left p-2">Humidity</th>
                  <th className="text-left p-2">Gas</th>
                  <th className="text-left p-2">Water Level</th>
                </tr>
              </thead>
              <tbody>
                {(readings as Record<string, unknown>[]).map((r, i) => (
                  <tr key={i} className="border-t">
                    <td className="p-2">
                      {r.timestamp
                        ? formatDate(
                            typeof r.timestamp === "string"
                              ? r.timestamp
                              : (r.timestamp as { $date?: string })?.$date ?? ""
                          )
                        : "—"}
                    </td>
                    <td className="p-2">{String(r.air_temperature ?? "—")}</td>
                    <td className="p-2">{String(r.water_temperature ?? "—")}</td>
                    <td className="p-2">{String(r.humidity ?? "—")}</td>
                    <td className="p-2">{String(r.gas_value ?? "—")}</td>
                    <td className="p-2">{String(r.water_level ?? "—")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {readings.length === 0 && device.type === "FM" && (
            <p className="text-sm text-muted-foreground">
              No sensor data yet. ESP32 should send device_serial_number as device_id when posting to FM.
            </p>
          )}
        </div>
      ) : null}
    </Dialog>
  )
}
