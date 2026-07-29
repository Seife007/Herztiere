import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function GuestRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-cream-50 text-stone-500">
        Lädt …
      </div>
    )
  }

  if (user) {
    return <Navigate to="/entdecken" replace />
  }

  return <>{children}</>
}
