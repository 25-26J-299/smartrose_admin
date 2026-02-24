import { Routes, Route, Navigate } from 'react-router-dom'
import DashboardLayout from './pages/DashboardLayout'
import LoginPage from './pages/LoginPage'
import OverviewPage from './pages/OverviewPage'
import UsersPage from './pages/UsersPage'
import GreenhousesPage from './pages/GreenhousesPage'
import DevicesPage from './pages/DevicesPage'
import AnalyticsPage from './pages/AnalyticsPage'
import SystemPage from './pages/SystemPage'
import AuditLogsPage from './pages/AuditLogsPage'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<Navigate to="/overview" replace />} />
        <Route path="overview" element={<OverviewPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="greenhouses" element={<GreenhousesPage />} />
        <Route path="devices" element={<DevicesPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="system" element={<SystemPage />} />
        <Route path="audit-logs" element={<AuditLogsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/overview" replace />} />
    </Routes>
  )
}
