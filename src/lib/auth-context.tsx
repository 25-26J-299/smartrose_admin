import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { getToken, clearToken } from "./api"

interface AuthState {
  token: string | null
  isAuthenticated: boolean
  logout: () => void
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    setToken(getToken())
  }, [])

  const logout = () => {
    clearToken()
    setToken(null)
    window.location.href = "/login"
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        isAuthenticated: !!token,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
