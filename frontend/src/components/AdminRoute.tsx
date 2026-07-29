import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function AdminRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return <div className="flex min-h-svh items-center justify-center bg-slate-50 text-slate-500">Lädt …</div>
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  if (user.role !== 'admin') {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-2 bg-slate-50 px-4 text-center">
        <p className="text-lg font-semibold text-slate-800">Kein Zugriff</p>
        <p className="text-sm text-slate-500">Dieser Bereich ist nur für Admins zugänglich.</p>
      </div>
    )
  }

  return <>{children}</>
}
