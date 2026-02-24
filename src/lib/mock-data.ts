import type { User, Greenhouse, Device, AuditLog, SystemStats, ChartDataPoint } from "@/types"

export const mockStats: SystemStats = {
  total_users: 248,
  active_users: 193,
  total_greenhouses: 87,
  active_greenhouses: 74,
  total_devices: 312,
  online_devices: 289,
  total_sensor_readings_today: 14820,
  total_ml_predictions_today: 3640,
  alerts_today: 12,
  api_uptime_percent: 99.7,
}

export const mockUsers: User[] = [
  { id: "u1", name: "Samantha Perera", email: "samantha@farm.lk", role: "farmer", is_active: true, subscription_tier: "pro", greenhouse_count: 3, created_at: "2025-10-01", last_login: "2026-02-23" },
  { id: "u2", name: "Nimal Silva", email: "nimal@florist.lk", role: "florist", is_active: true, subscription_tier: "basic", greenhouse_count: 1, created_at: "2025-11-15", last_login: "2026-02-22" },
  { id: "u3", name: "Priya Fernando", email: "priya@rose.lk", role: "farmer", is_active: false, subscription_tier: "basic", greenhouse_count: 2, created_at: "2025-09-20", last_login: "2026-01-10" },
  { id: "u4", name: "Kamal Bandara", email: "kamal@greenhouse.lk", role: "farmer", is_active: true, subscription_tier: "enterprise", greenhouse_count: 8, created_at: "2025-08-01", last_login: "2026-02-23" },
  { id: "u5", name: "Dilani Jayawardena", email: "dilani@flowers.lk", role: "florist", is_active: true, subscription_tier: "pro", greenhouse_count: 2, created_at: "2025-12-05", last_login: "2026-02-21" },
  { id: "u6", name: "Ruwan Wijeratne", email: "ruwan@agri.lk", role: "farmer", is_active: true, subscription_tier: "basic", greenhouse_count: 1, created_at: "2026-01-10", last_login: "2026-02-20" },
  { id: "u7", name: "Chamali Ranasinghe", email: "chamali@bloom.lk", role: "farmer", is_active: true, subscription_tier: "pro", greenhouse_count: 4, created_at: "2025-07-15", last_login: "2026-02-23" },
  { id: "u8", name: "Saman Kumara", email: "saman@garden.lk", role: "florist", is_active: false, subscription_tier: "basic", greenhouse_count: 0, created_at: "2026-01-25", last_login: "2026-02-01" },
]

export const mockGreenhouses: Greenhouse[] = [
  { id: "gh1", name: "Kandy Rose Farm A", owner_id: "u1", owner_name: "Samantha Perera", owner_email: "samantha@farm.lk", location: { lat: 7.2906, lng: 80.6337, address: "Kandy, Sri Lanka" }, type: "rose_production", status: "active", device_count: 5, member_count: 2, created_at: "2025-10-05", last_activity: "2026-02-23" },
  { id: "gh2", name: "Nuwara Eliya Bloom House", owner_id: "u4", owner_name: "Kamal Bandara", owner_email: "kamal@greenhouse.lk", location: { lat: 6.9497, lng: 80.7891, address: "Nuwara Eliya, Sri Lanka" }, type: "rose_production", status: "active", device_count: 12, member_count: 5, created_at: "2025-08-10", last_activity: "2026-02-23" },
  { id: "gh3", name: "Colombo Florist Lab", owner_id: "u2", owner_name: "Nimal Silva", owner_email: "nimal@florist.lk", location: { lat: 6.9271, lng: 79.8612, address: "Colombo, Sri Lanka" }, type: "freshness_monitoring", status: "active", device_count: 3, member_count: 1, created_at: "2025-11-20", last_activity: "2026-02-22" },
  { id: "gh4", name: "Galle Rose Garden", owner_id: "u3", owner_name: "Priya Fernando", owner_email: "priya@rose.lk", location: { lat: 6.0535, lng: 80.2210, address: "Galle, Sri Lanka" }, type: "rose_production", status: "inactive", device_count: 4, member_count: 0, created_at: "2025-09-25", last_activity: "2026-01-08" },
  { id: "gh5", name: "Matale Cultivation Unit", owner_id: "u7", owner_name: "Chamali Ranasinghe", owner_email: "chamali@bloom.lk", location: { lat: 7.4675, lng: 80.6234, address: "Matale, Sri Lanka" }, type: "rose_production", status: "active", device_count: 7, member_count: 3, created_at: "2025-07-20", last_activity: "2026-02-23" },
]

export const mockDevices: Device[] = [
  { id: "dev1", name: "INM Unit Alpha", greenhouse_id: "gh1", greenhouse_name: "Kandy Rose Farm A", owner_name: "Samantha Perera", type: "INM", status: "online", last_seen: "2026-02-23T18:00:00Z", data_frequency_min: 5, firmware_version: "v2.1.0", created_at: "2025-10-06" },
  { id: "dev2", name: "EDAS Sensor Beta", greenhouse_id: "gh1", greenhouse_name: "Kandy Rose Farm A", owner_name: "Samantha Perera", type: "EDAS", status: "online", last_seen: "2026-02-23T17:58:00Z", data_frequency_min: 10, firmware_version: "v1.3.2", created_at: "2025-10-06" },
  { id: "dev3", name: "EOSM Node 01", greenhouse_id: "gh2", greenhouse_name: "Nuwara Eliya Bloom House", owner_name: "Kamal Bandara", type: "EOSM", status: "online", last_seen: "2026-02-23T18:01:00Z", data_frequency_min: 15, firmware_version: "v1.0.5", created_at: "2025-08-11" },
  { id: "dev4", name: "FM Unit Gamma", greenhouse_id: "gh3", greenhouse_name: "Colombo Florist Lab", owner_name: "Nimal Silva", type: "FM", status: "warning", last_seen: "2026-02-23T15:00:00Z", data_frequency_min: 30, firmware_version: "v2.0.1", created_at: "2025-11-21" },
  { id: "dev5", name: "INM Unit Delta", greenhouse_id: "gh4", greenhouse_name: "Galle Rose Garden", owner_name: "Priya Fernando", type: "INM", status: "offline", last_seen: "2026-01-07T10:00:00Z", data_frequency_min: 5, firmware_version: "v2.0.0", created_at: "2025-09-26" },
  { id: "dev6", name: "EDAS Sensor Zeta", greenhouse_id: "gh5", greenhouse_name: "Matale Cultivation Unit", owner_name: "Chamali Ranasinghe", type: "EDAS", status: "online", last_seen: "2026-02-23T17:55:00Z", data_frequency_min: 10, firmware_version: "v1.3.2", created_at: "2025-07-21" },
  { id: "dev7", name: "EOSM Node 02", greenhouse_id: "gh2", greenhouse_name: "Nuwara Eliya Bloom House", owner_name: "Kamal Bandara", type: "EOSM", status: "online", last_seen: "2026-02-23T18:00:00Z", data_frequency_min: 15, firmware_version: "v1.0.5", created_at: "2025-08-12" },
]

export const mockAuditLogs: AuditLog[] = [
  { id: "al1", admin_id: "admin1", admin_name: "Super Admin", action: "DEACTIVATE_USER", resource_type: "user", resource_id: "u3", details: "Account deactivated due to inactivity", ip_address: "192.168.1.1", timestamp: "2026-02-23T14:30:00Z" },
  { id: "al2", admin_id: "admin1", admin_name: "Super Admin", action: "CHANGE_ROLE", resource_type: "user", resource_id: "u6", details: "Role changed from florist to farmer", ip_address: "192.168.1.1", timestamp: "2026-02-23T12:15:00Z" },
  { id: "al3", admin_id: "admin1", admin_name: "Super Admin", action: "REVOKE_DEVICE_KEY", resource_type: "device", resource_id: "dev5", details: "API key revoked", ip_address: "192.168.1.1", timestamp: "2026-02-22T16:00:00Z" },
  { id: "al4", admin_id: "admin1", admin_name: "Super Admin", action: "VIEW_USER", resource_type: "user", resource_id: "u4", details: "Profile viewed", ip_address: "192.168.1.1", timestamp: "2026-02-22T11:00:00Z" },
  { id: "al5", admin_id: "admin1", admin_name: "Super Admin", action: "DELETE_GREENHOUSE", resource_type: "greenhouse", resource_id: "gh_old", details: "Removed abandoned greenhouse", ip_address: "192.168.1.1", timestamp: "2026-02-21T09:30:00Z" },
]

export const mockSensorChartData: ChartDataPoint[] = [
  { date: "Feb 17", value: 11200 },
  { date: "Feb 18", value: 13400 },
  { date: "Feb 19", value: 12800 },
  { date: "Feb 20", value: 15100 },
  { date: "Feb 21", value: 9800 },
  { date: "Feb 22", value: 13600 },
  { date: "Feb 23", value: 14820 },
]

export const mockUserGrowthData: ChartDataPoint[] = [
  { date: "Aug", value: 42 },
  { date: "Sep", value: 68 },
  { date: "Oct", value: 95 },
  { date: "Nov", value: 124 },
  { date: "Dec", value: 167 },
  { date: "Jan", value: 210 },
  { date: "Feb", value: 248 },
]

export const mockAlertData: ChartDataPoint[] = [
  { date: "Feb 17", value: 8 },
  { date: "Feb 18", value: 15 },
  { date: "Feb 19", value: 6 },
  { date: "Feb 20", value: 19 },
  { date: "Feb 21", value: 4 },
  { date: "Feb 22", value: 10 },
  { date: "Feb 23", value: 12 },
]
