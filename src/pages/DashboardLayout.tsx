import { useEffect } from "react"
import { Outlet, useNavigate } from "react-router-dom"
import Sidebar from "@/components/layout/Sidebar"
import { getToken } from "@/lib/api"

export default function DashboardLayout() {
  const navigate = useNavigate()
  useEffect(() => {
    if (!getToken()) {
      navigate("/login", { replace: true })
    }
  }, [navigate])

  if (!getToken()) {
    return null
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Outlet />
      </main>
    </div>
  )
}
