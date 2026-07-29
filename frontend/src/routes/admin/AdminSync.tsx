import { useEffect, useState } from 'react'
import { api, ApiError } from '../../lib/api'
import type { SyncRun } from '../../lib/types'

const STATUS_LABELS: Record<SyncRun['status'], string> = {
  running: 'Läuft …',
  success: 'Erfolgreich',
  error: 'Fehler',
}

export function AdminSync() {
  const [runs, setRuns] = useState<SyncRun[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isTriggering, setIsTriggering] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function load() {
    setIsLoading(true)
    api
      .get<{ syncRuns: SyncRun[] }>('/api/admin/sync-runs')
      .then((data) => setRuns(data.syncRuns))
      .finally(() => setIsLoading(false))
  }

  useEffect(load, [])

  async function handleTrigger() {
    setIsTriggering(true)
    setError(null)
    try {
      await api.post('/api/admin/sync')
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Sync fehlgeschlagen')
    } finally {
      setIsTriggering(false)
      load()
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Sync-Läufe</h1>
        <button
          onClick={handleTrigger}
          disabled={isTriggering}
          className="rounded-md bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-900 disabled:opacity-60"
        >
          {isTriggering ? 'Läuft …' : 'Sync jetzt auslösen'}
        </button>
      </div>

      {error && <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-100 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-2">Gestartet</th>
              <th className="px-4 py-2">Ausgelöst von</th>
              <th className="px-4 py-2">Ergebnis</th>
              <th className="px-4 py-2">Neu</th>
              <th className="px-4 py-2">Aktualisiert</th>
              <th className="px-4 py-2">Entfernt</th>
              <th className="px-4 py-2">Fehler</th>
            </tr>
          </thead>
          <tbody>
            {!isLoading && runs.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-slate-400">
                  Noch keine Sync-Läufe.
                </td>
              </tr>
            )}
            {runs.map((run) => (
              <tr key={run.id} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-2 text-slate-600">{new Date(run.startedAt).toLocaleString('de-AT')}</td>
                <td className="px-4 py-2 text-slate-600">{run.triggeredBy}</td>
                <td className="px-4 py-2">
                  <span
                    className={
                      run.status === 'success'
                        ? 'text-emerald-600'
                        : run.status === 'error'
                          ? 'text-red-600'
                          : 'text-slate-500'
                    }
                  >
                    {STATUS_LABELS[run.status]}
                  </span>
                </td>
                <td className="px-4 py-2">{run.createdCount}</td>
                <td className="px-4 py-2">{run.updatedCount}</td>
                <td className="px-4 py-2">{run.removedCount}</td>
                <td className="px-4 py-2 text-red-600">{run.errorMessage ?? '–'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
