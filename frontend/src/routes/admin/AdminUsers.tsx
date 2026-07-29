import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../lib/api'
import type { AdminUser } from '../../lib/types'

const PAGE_SIZE = 20

export function AdminUsers() {
  const [search, setSearch] = useState('')
  const [role, setRole] = useState<'' | 'user' | 'admin'>('')
  const [status, setStatus] = useState<'' | 'active' | 'blocked'>('')
  const [page, setPage] = useState(1)

  const [users, setUsers] = useState<AdminUser[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setPage(1)
  }, [search, role, status])

  useEffect(() => {
    const params = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) })
    if (search) params.set('search', search)
    if (role) params.set('role', role)
    if (status) params.set('status', status)

    setIsLoading(true)
    const timeout = setTimeout(() => {
      api
        .get<{ users: AdminUser[]; total: number }>(`/api/admin/users?${params}`)
        .then((data) => {
          setUsers(data.users)
          setTotal(data.total)
        })
        .finally(() => setIsLoading(false))
    }, 250)

    return () => clearTimeout(timeout)
  }, [search, role, status, page])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-900">Nutzer:innen</h1>

      <div className="mt-4 flex flex-wrap gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="E-Mail suchen …"
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-slate-500"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as typeof role)}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm"
        >
          <option value="">Alle Rollen</option>
          <option value="user">Nutzer:in</option>
          <option value="admin">Admin</option>
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as typeof status)}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm"
        >
          <option value="">Alle Status</option>
          <option value="active">Aktiv</option>
          <option value="blocked">Gesperrt</option>
        </select>
      </div>

      <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-100 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-2">E-Mail</th>
              <th className="px-4 py-2">Rolle</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Likes</th>
              <th className="px-4 py-2">Registriert</th>
            </tr>
          </thead>
          <tbody>
            {!isLoading && users.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                  Keine Nutzer:innen gefunden.
                </td>
              </tr>
            )}
            {users.map((user) => (
              <tr key={user.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                <td className="px-4 py-2">
                  <Link to={`/admin/users/${user.id}`} className="font-medium text-slate-800 hover:underline">
                    {user.email}
                  </Link>
                </td>
                <td className="px-4 py-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      user.role === 'admin' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-2">
                  {user.isBlocked ? (
                    <span className="text-red-600">Gesperrt</span>
                  ) : (
                    <span className="text-emerald-600">Aktiv</span>
                  )}
                </td>
                <td className="px-4 py-2">{user.likeCount}</td>
                <td className="px-4 py-2 text-slate-500">{new Date(user.createdAt).toLocaleDateString('de-AT')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex items-center justify-between text-sm text-slate-500">
        <span>{total} Nutzer:innen insgesamt</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="rounded-md border border-slate-300 px-3 py-1 disabled:opacity-40"
          >
            Zurück
          </button>
          <span>
            Seite {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="rounded-md border border-slate-300 px-3 py-1 disabled:opacity-40"
          >
            Weiter
          </button>
        </div>
      </div>
    </div>
  )
}
