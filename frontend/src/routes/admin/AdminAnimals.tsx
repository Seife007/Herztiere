import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../lib/api'
import type { AdminAnimal } from '../../lib/types'
import { categoryLabel, statusLabel } from '../../lib/animalLabels'

const PAGE_SIZE = 20
const CATEGORIES = ['01_Hunde', '02_Katzen', '03_Andere Tiere']

export function AdminAnimals() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<'' | 'active' | 'adopted' | 'removed'>('')
  const [category, setCategory] = useState('')
  const [syncedBefore, setSyncedBefore] = useState('')
  const [page, setPage] = useState(1)

  const [animals, setAnimals] = useState<AdminAnimal[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setPage(1)
  }, [search, status, category, syncedBefore])

  useEffect(() => {
    const params = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) })
    if (search) params.set('search', search)
    if (status) params.set('status', status)
    if (category) params.set('category', category)
    if (syncedBefore) params.set('syncedBefore', new Date(syncedBefore).toISOString())

    setIsLoading(true)
    const timeout = setTimeout(() => {
      api
        .get<{ animals: AdminAnimal[]; total: number }>(`/api/admin/animals?${params}`)
        .then((data) => {
          setAnimals(data.animals)
          setTotal(data.total)
        })
        .finally(() => setIsLoading(false))
    }, 250)

    return () => clearTimeout(timeout)
  }, [search, status, category, syncedBefore, page])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-900">Tiere</h1>

      <div className="mt-4 flex flex-wrap gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Titel suchen …"
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-slate-500"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as typeof status)}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm"
        >
          <option value="">Alle Status</option>
          <option value="active">Verfügbar</option>
          <option value="adopted">Vermittelt</option>
          <option value="removed">Nicht mehr verfügbar</option>
        </select>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm"
        >
          <option value="">Alle Arten</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {categoryLabel(c)}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          Nicht synchronisiert seit
          <input
            type="date"
            value={syncedBefore}
            onChange={(e) => setSyncedBefore(e.target.value)}
            className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          />
        </label>
      </div>

      <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-100 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-2">Titel</th>
              <th className="px-4 py-2">Art</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Bearbeitet</th>
              <th className="px-4 py-2">Ausgeblendet</th>
              <th className="px-4 py-2">Zuletzt synchronisiert</th>
            </tr>
          </thead>
          <tbody>
            {!isLoading && animals.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                  Keine Tiere gefunden.
                </td>
              </tr>
            )}
            {animals.map((animal) => (
              <tr key={animal.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                <td className="px-4 py-2">
                  <Link to={`/admin/animals/${animal.id}`} className="font-medium text-slate-800 hover:underline">
                    {animal.title}
                  </Link>
                </td>
                <td className="px-4 py-2">{categoryLabel(animal.category)}</td>
                <td className="px-4 py-2">{statusLabel(animal.status)}</td>
                <td className="px-4 py-2">{animal.manuallyEdited ? '✓' : '–'}</td>
                <td className="px-4 py-2">{animal.isHidden ? '✓' : '–'}</td>
                <td className="px-4 py-2 text-slate-500">
                  {animal.lastSyncedAt ? new Date(animal.lastSyncedAt).toLocaleString('de-AT') : '–'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex items-center justify-between text-sm text-slate-500">
        <span>{total} Tiere insgesamt</span>
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
