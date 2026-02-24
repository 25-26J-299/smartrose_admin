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

export async function login(email: string, password: string): Promise<{ token: string; user: { id: string; name: string; email: string; roles: string[] } }> {
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

export async function fetchUsers(): Promise<ApiUser[]> {
  const token = getToken()
  if (!token) throw new Error("Not authenticated")
  const res = await fetch(`${API_BASE}/admin/users`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (res.status === 401) throw new Error("Session expired")
  if (res.status === 403) throw new Error("Admin access required")
  if (!res.ok) throw new Error("Failed to fetch users")
  const data = await res.json()
  return data.users ?? []
}

/** Raw user from backend API */
export interface ApiUser {
  _id: string
  name: string
  email: string
  roles: string[]
  created_at: string
}
