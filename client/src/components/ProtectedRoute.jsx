import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/auth.js'

/** Gate for signed-in routes; keeps the target path (e.g. a QR join link) in ?next=. */
export default function ProtectedRoute() {
  const { status } = useAuth()
  const location = useLocation()

  if (status === 'loading') return <p className="page-loading">กำลังตรวจสอบการเข้าสู่ระบบ…</p>
  if (status === 'anonymous') {
    const next = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?next=${next}`} replace />
  }
  return <Outlet />
}
