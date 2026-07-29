import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api, ApiError } from '../../lib/api'
import type { AdminUser } from '../../lib/types'

export function AdminUserDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [user, setUser] = useState<AdminUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [actionError, setActionError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  function load() {
    setIsLoading(true)
    api
      .get<{ user: AdminUser }>(`/api/admin/users/${id}`)
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false))
  }

  useEffect(load, [id])

  async function toggleBlocked() {
    if (!user) return
    setActionError(null)
    try {
      const data = await api.patch<{ user: AdminUser }>(`/api/admin/users/${user.id}/block`, {
        isBlocked: !user.isBlocked,
      })
      setUser(data.user)
    } catch (error) {
      setActionError(error instanceof ApiError ? error.message : 'Aktion fehlgeschlagen')
    }
  }

  async function changeRole(role: 'user' | 'admin') {
    if (!user) return
    setActionError(null)
    try {
      const data = await api.patch<{ user: AdminUser }>(`/api/admin/users/${user.id}/role`, { role })
      setUser(data.user)
    } catch (error) {
      setActionError(error instanceof ApiError ? error.message : 'Aktion fehlgeschlagen')
    }
  }

  async function triggerPasswordReset() {
    if (!user) return
    setActionError(null)
    setMessage(null)
    try {
      const data = await api.post<{ message: string }>(`/api/admin/users/${user.id}/reset-password`)
      setMessage(data.message)
    } catch (error) {
      setActionError(error instanceof ApiError ? error.message : 'Aktion fehlgeschlagen')
    }
  }

  async function handleDelete() {
    if (!user) return
    setActionError(null)
    try {
      await api.delete(`/api/admin/users/${user.id}`)
      navigate('/admin/users')
    } catch (error) {
      setActionError(error instanceof ApiError ? error.message : 'Aktion fehlgeschlagen')
    }
  }

  if (isLoading) return <p className="text-slate-500">Lädt …</p>
  if (!user) return <p className="text-slate-500">Nutzer:in nicht gefunden.</p>

  return (
    <div className="max-w-2xl">
      <Link to="/admin/users" className="text-sm text-slate-500 hover:underline">
        ← Zurück zur Liste
      </Link>
      <h1 className="mt-2 text-xl font-bold text-slate-900">{user.email}</h1>

      {actionError && (
        <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{actionError}</p>
      )}
      {message && <p className="mt-3 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p>}

      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 rounded-lg border border-slate-200 bg-white p-4 text-sm">
        <dt className="text-slate-500">Registriert am</dt>
        <dd>{new Date(user.createdAt).toLocaleString('de-AT')}</dd>
        <dt className="text-slate-500">Anzahl Likes</dt>
        <dd>{user.likeCount}</dd>
        <dt className="text-slate-500">Rolle</dt>
        <dd>{user.role}</dd>
        <dt className="text-slate-500">Status</dt>
        <dd>{user.isBlocked ? 'Gesperrt' : 'Aktiv'}</dd>
        <dt className="text-slate-500">Interessen</dt>
        <dd>{user.preferences.speciesInterest?.join(', ') || '–'}</dd>
        <dt className="text-slate-500">Erfahrung</dt>
        <dd>{user.preferences.experienceLevel ?? '–'}</dd>
      </dl>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          onClick={toggleBlocked}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100"
        >
          {user.isBlocked ? 'Entsperren' : 'Sperren'}
        </button>
        <button
          onClick={() => changeRole(user.role === 'admin' ? 'user' : 'admin')}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100"
        >
          {user.role === 'admin' ? 'Admin-Rechte entziehen' : 'Zum Admin machen'}
        </button>
        <button
          onClick={triggerPasswordReset}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100"
        >
          Passwort-Reset auslösen
        </button>
      </div>

      <div className="mt-8 rounded-lg border border-red-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-red-700">Nutzer:in löschen</h2>
        <p className="mt-1 text-sm text-slate-500">Unwiderruflich, inkl. Merkliste. Wird im Audit-Log erfasst.</p>
        {!confirmingDelete ? (
          <button
            onClick={() => setConfirmingDelete(true)}
            className="mt-3 rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
          >
            Löschen
          </button>
        ) : (
          <div className="mt-3 flex items-center gap-3">
            <span className="text-sm font-medium text-slate-800">Wirklich löschen?</span>
            <button
              onClick={handleDelete}
              className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Ja, löschen
            </button>
            <button
              onClick={() => setConfirmingDelete(false)}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100"
            >
              Abbrechen
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
