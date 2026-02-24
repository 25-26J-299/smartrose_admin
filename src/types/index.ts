export type UserRole = "admin" | "superadmin" | "farmer" | "florist"
export type DeviceType = "INM" | "EOSM" | "EDAS" | "FM"
export type DeviceStatus = "online" | "offline" | "warning"
export type GreenhouseStatus = "active" | "inactive"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  is_active: boolean
  subscription_tier: "basic" | "pro" | "enterprise"
  greenhouse_count: number
  created_at: string
  last_login?: string
}

export interface Greenhouse {
  id: string
  name: string
  owner_id: string
  owner_name: string
  owner_email: string
  location?: { lat: number; lng: number; address?: string }
  description?: string
  type: string
  status: GreenhouseStatus
  device_count: number
  member_count: number
  created_at: string
  last_activity?: string
}

export interface Device {
  id: string
  name: string
  greenhouse_id: string
  greenhouse_name: string
  owner_name: string
  type: DeviceType
  status: DeviceStatus
  last_seen?: string
  data_frequency_min?: number
  firmware_version?: string
  created_at: string
}

export interface AuditLog {
  id: string
  admin_id: string
  admin_name: string
  action: string
  resource_type: string
  resource_id: string
  details?: string
  ip_address?: string
  timestamp: string
}

export interface SystemStats {
  total_users: number
  active_users: number
  total_greenhouses: number
  active_greenhouses: number
  total_devices: number
  online_devices: number
  total_sensor_readings_today: number
  total_ml_predictions_today: number
  alerts_today: number
  api_uptime_percent: number
}

export interface ChartDataPoint {
  date: string
  value: number
  label?: string
}
