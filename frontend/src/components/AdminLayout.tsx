import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function AdminNavLink({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
          isActive ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-200'
        }`
      }
    >
      {label}
    </NavLink>
  )
}

export function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/')
  }

  return (
    <div className="min-h-svh bg-slate-50 text-slate-800">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex flex-wrap items-center gap-4">
            <Link to="/admin" className="text-base font-bold text-slate-900">
              herztiere admin
            </Link>
            <nav className="flex items-center gap-1">
              <AdminNavLink to="/admin/users" label="Nutzer:innen" />
              <AdminNavLink to="/admin/animals" label="Tiere" />
              <AdminNavLink to="/admin/sync" label="Sync" />
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <Link to="/entdecken" className="hover:text-slate-800 hover:underline">
              Zur App
            </Link>
            <span>{user?.email}</span>
            <button onClick={handleLogout} className="font-medium text-slate-600 hover:text-slate-900">
              Abmelden
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
