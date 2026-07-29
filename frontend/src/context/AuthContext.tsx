import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { api, ApiError } from '../lib/api'
import type { Preferences, User } from '../lib/types'

interface AuthContextValue {
  user: User | null
  isLoading: boolean
  register: (email: string, password: string, preferences: Preferences) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  updatePreferences: (preferences: Preferences) => Promise<void>
  deleteAccount: () => Promise<void>
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const data = await api.get<{ user: User }>('/api/users/me')
      setUser(data.user)
    } catch (error) {
      if (!(error instanceof ApiError && error.status === 401)) {
        console.error(error)
      }
      setUser(null)
    }
  }, [])

  useEffect(() => {
    refresh().finally(() => setIsLoading(false))
  }, [refresh])

  const register = useCallback(async (email: string, password: string, preferences: Preferences) => {
    const data = await api.post<{ user: User }>('/api/auth/register', { email, password, preferences })
    setUser(data.user)
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const data = await api.post<{ user: User }>('/api/auth/login', { email, password })
    setUser(data.user)
  }, [])

  const logout = useCallback(async () => {
    await api.post('/api/auth/logout')
    setUser(null)
  }, [])

  const updatePreferences = useCallback(async (preferences: Preferences) => {
    const data = await api.patch<{ user: User }>('/api/users/me', { preferences })
    setUser(data.user)
  }, [])

  const deleteAccount = useCallback(async () => {
    await api.delete('/api/users/me')
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{ user, isLoading, register, login, logout, updatePreferences, deleteAccount, refresh }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth muss innerhalb von AuthProvider verwendet werden')
  return context
}
