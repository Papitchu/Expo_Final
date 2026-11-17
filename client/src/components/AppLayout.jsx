import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/auth.js'

export default function AppLayout() {
  const { user, logout } = useAuth()

  return (
    <div className="app-shell">
      <header className="app-header">
        <Link className="app-brand" to="/">
          <span className="brand-mark">S</span>
          <span>seat<span className="brand-dot">.</span>kmutt</span>
        </Link>
        <nav aria-label="เมนูหลัก">
          <NavLink to="/" end>ค้นหาพื้นที่</NavLink>
          <NavLink to="/bookings">การจองของฉัน</NavLink>
          <button type="button" onClick={logout} title={user?.email}>ออกจากระบบ</button>
        </nav>
      </header>
      <main className="content" aria-live="polite">
        <Outlet />
      </main>
      <footer>พื้นที่สำหรับอ่านหนังสือและทำงาน · KMUTT</footer>
    </div>
  )
}
