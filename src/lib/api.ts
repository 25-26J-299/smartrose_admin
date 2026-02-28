/**
 * API client for SmartRose backend.
 * Set VITE_API_BASE_URL in .env or .env.local (default: http://localhost:8000/api/v1)
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1"

const AUTH_KEY = "smartrose_admin_token"

export function getToken(): string | null {
  return localStorage.getItem(AUTH_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(AUTH_KEY, token)
}

export function clearToken(): void {
  localStorage.removeItem(AUTH_KEY)
}

export async function login(
  email: string,
  password: string
): Promise<{
  token: string
  user: { id: string; full_name: string; email: string; role: string }
}> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Login failed" }))
    throw new Error(err.detail ?? "Login failed")
  }
  const data = await res.json()
  setToken(data.access_token)
  return { token: data.access_token, user: data.user }
}

function handleUnauthorized(): never {
  clearToken()
  window.location.href = "/login"
  throw new Error("Session expired")
}

export async function fetchUsers(status?: "approved" | "pending" | "rejected"): Promise<ApiUser[]> {
  const token = getToken()
  if (!token) handleUnauthorized()
  const url = status ? `${API_BASE}/admin/users?status=${status}` : `${API_BASE}/admin/users`
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (res.status === 401) handleUnauthorized()
  if (res.status === 403) throw new Error("Admin access required")
  if (!res.ok) throw new Error("Failed to fetch users")
  const data = await res.json()
  return data.users ?? []
}

export async function updateUserRole(userId: string, role: string): Promise<ApiUser> {
  const token = getToken()
  if (!token) handleUnauthorized()
  const res = await fetch(`${API_BASE}/admin/users/${userId}/role`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ role }),
  })
  if (res.status === 401) handleUnauthorized()
  if (!res.ok) throw new Error("Failed to update role")
  const data = await res.json()
  return data.user
}

export async function updateUserStatus(userId: string, status: string): Promise<ApiUser> {
  const token = getToken()
  if (!token) handleUnauthorized()
  const res = await fetch(`${API_BASE}/admin/users/${userId}/status`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  })
  if (res.status === 401) handleUnauthorized()
  if (!res.ok) throw new Error("Failed to update status")
  const data = await res.json()
  return data.user
}

export async function fetchUserWithLocations(userId: string): Promise<{
  user: ApiUser
  locations: ApiLocation[]
}> {
  const token = getToken()
  if (!token) handleUnauthorized()
  const res = await fetch(`${API_BASE}/admin/users/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (res.status === 401) handleUnauthorized()
  if (res.status === 404) throw new Error("User not found")
  if (!res.ok) throw new Error("Failed to fetch user")
  const data = await res.json()
  return { user: data.user, locations: data.locations ?? [] }
}

export async function updateUser(
  userId: string,
  data: { full_name?: string; phone?: string; role?: string }
): Promise<ApiUser> {
  const token = getToken()
  if (!token) handleUnauthorized()
  const res = await fetch(`${API_BASE}/admin/users/${userId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
  if (res.status === 401) handleUnauthorized()
  if (!res.ok) throw new Error("Failed to update user")
  const json = await res.json()
  return json.user
}

export async function updateLocation(
  locationId: string,
  data: { name?: string; type?: string; address?: string }
): Promise<ApiLocation> {
  const token = getToken()
  if (!token) handleUnauthorized()
  const res = await fetch(`${API_BASE}/admin/locations/${locationId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
  if (res.status === 401) handleUnauthorized()
  if (!res.ok) throw new Error("Failed to update location")
  const json = await res.json()
  return json.location
}

/** Raw user from backend API */
export interface ApiUser {
  _id: string
  full_name: string
  email: string
  phone?: string
  role: string
  status: string
  created_at: string
  updated_at?: string
  last_login?: string
  is_active: boolean
}

export async function searchApprovedUsers(query: string): Promise<SearchResult[]> {
  const token = getToken()
  if (!token) handleUnauthorized()
  const res = await fetch(`${API_BASE}/admin/search?q=${encodeURIComponent(query)}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (res.status === 401) handleUnauthorized()
  if (!res.ok) throw new Error("Search failed")
  const data = await res.json()
  return data.results ?? []
}

export async function createDevice(data: {
  location_id: string
  user_id: string
  name: string
  type: string
  device_serial_number: string
}): Promise<ApiDevice> {
  const token = getToken()
  if (!token) handleUnauthorized()
  const res = await fetch(`${API_BASE}/admin/devices`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
  if (res.status === 401) handleUnauthorized()
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail ?? "Failed to create device")
  }
  const json = await res.json()
  return json.device
}

export async function fetchDevices(params?: {
  location_id?: string
  user_id?: string
}): Promise<ApiDevice[]> {
  const token = getToken()
  if (!token) handleUnauthorized()
  const search = new URLSearchParams(params as Record<string, string>).toString()
  const url = search ? `${API_BASE}/admin/devices?${search}` : `${API_BASE}/admin/devices`
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
  if (res.status === 401) handleUnauthorized()
  if (!res.ok) throw new Error("Failed to fetch devices")
  const data = await res.json()
  return data.devices ?? []
}

export async function fetchDeviceSensorData(
  deviceId: string,
  limit?: number
): Promise<{ device: ApiDevice; readings: unknown[]; count: number }> {
  const token = getToken()
  if (!token) handleUnauthorized()
  const url = limit
    ? `${API_BASE}/admin/devices/${deviceId}/sensor-data?limit=${limit}`
    : `${API_BASE}/admin/devices/${deviceId}/sensor-data`
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
  if (res.status === 401) handleUnauthorized()
  if (res.status === 404) throw new Error("Device not found")
  if (!res.ok) throw new Error("Failed to fetch sensor data")
  const data = await res.json()
  return {
    device: data.device,
    readings: data.readings ?? [],
    count: data.count ?? 0,
  }
}

export interface SearchResult {
  user: ApiUser
  locations: ApiLocation[]
}

export interface ApiDevice {
  _id: string
  location_id: string
  user_id: string
  name: string
  type: string
  device_serial_number: string
  last_seen?: string
  created_at?: string
  updated_at?: string
}

/** Raw location from backend API */
export interface ApiLocation {
  _id: string
  user_id: string
  name: string
  type: string
  address: string
  created_at?: string
  updated_at?: string
  is_active?: boolean
}
