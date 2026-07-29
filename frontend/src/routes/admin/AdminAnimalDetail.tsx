import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api, ApiError } from '../../lib/api'
import type { AdminAnimal } from '../../lib/types'
import { categoryLabel } from '../../lib/animalLabels'

type FieldType = 'text' | 'textarea' | 'number' | 'date' | 'checkbox' | 'select'

interface FieldConfig {
  key: string
  label: string
  type: FieldType
  options?: { value: string; label: string }[]
}

const OVERRIDE_FIELDS: FieldConfig[] = [
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'active', label: 'Verfügbar' },
      { value: 'adopted', label: 'Vermittelt' },
      { value: 'removed', label: 'Nicht mehr verfügbar' },
    ],
  },
  { key: 'title', label: 'Titel', type: 'text' },
  { key: 'breed', label: 'Rasse', type: 'text' },
  { key: 'gender', label: 'Geschlecht', type: 'text' },
  { key: 'color', label: 'Farbe', type: 'text' },
  { key: 'birthYear', label: 'Geburtsjahr', type: 'number' },
  { key: 'isMixed', label: 'Mischling', type: 'checkbox' },
  { key: 'description', label: 'Beschreibung', type: 'textarea' },
  { key: 'location', label: 'Fundort', type: 'text' },
  { key: 'foundDate', label: 'Funddatum', type: 'date' },
  { key: 'contactName', label: 'Kontaktperson', type: 'text' },
  { key: 'contactPhone', label: 'Telefon', type: 'text' },
  { key: 'contactEmail', label: 'E-Mail', type: 'text' },
]

function OverrideField({
  field,
  currentValue,
  overrideValue,
  isOverridden,
  onToggle,
  onChange,
}: {
  field: FieldConfig
  currentValue: unknown
  overrideValue: unknown
  isOverridden: boolean
  onToggle: () => void
  onChange: (value: unknown) => void
}) {
  const value = isOverridden ? overrideValue : currentValue

  return (
    <div className="grid grid-cols-[auto_140px_1fr] items-start gap-3 border-b border-slate-100 py-2 last:border-0">
      <input type="checkbox" checked={isOverridden} onChange={onToggle} className="mt-2" />
      <label className="pt-1.5 text-sm text-slate-600">{field.label}</label>
      {field.type === 'textarea' ? (
        <textarea
          disabled={!isOverridden}
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="rounded-md border border-slate-300 px-2 py-1.5 text-sm disabled:bg-slate-50 disabled:text-slate-400"
        />
      ) : field.type === 'select' ? (
        <select
          disabled={!isOverridden}
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
          className="rounded-md border border-slate-300 px-2 py-1.5 text-sm disabled:bg-slate-50 disabled:text-slate-400"
        >
          {field.options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : field.type === 'checkbox' ? (
        <input
          type="checkbox"
          disabled={!isOverridden}
          checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked)}
        />
      ) : (
        <input
          type={field.type}
          disabled={!isOverridden}
          value={(value as string | number) ?? ''}
          onChange={(e) => onChange(field.type === 'number' ? Number(e.target.value) : e.target.value)}
          className="rounded-md border border-slate-300 px-2 py-1.5 text-sm disabled:bg-slate-50 disabled:text-slate-400"
        />
      )}
    </div>
  )
}

export function AdminAnimalDetail() {
  const { id } = useParams<{ id: string }>()

  const [animal, setAnimal] = useState<AdminAnimal | null>(null)
  const [overrides, setOverrides] = useState<Record<string, unknown>>({})
  const [isHidden, setIsHidden] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setIsLoading(true)
    api
      .get<{ animal: AdminAnimal }>(`/api/admin/animals/${id}`)
      .then((data) => {
        setAnimal(data.animal)
        setOverrides(data.animal.overrides)
        setIsHidden(data.animal.isHidden)
      })
      .catch(() => setAnimal(null))
      .finally(() => setIsLoading(false))
  }, [id])

  function toggleOverride(key: string, currentValue: unknown) {
    setOverrides((current) => {
      if (key in current) {
        const { [key]: _removed, ...rest } = current
        return rest
      }
      return { ...current, [key]: currentValue }
    })
  }

  async function handleSave() {
    if (!animal) return
    setSaveState('saving')
    setError(null)
    try {
      const data = await api.patch<{ animal: AdminAnimal }>(`/api/admin/animals/${animal.id}`, {
        overrides,
        isHidden,
      })
      setAnimal(data.animal)
      setOverrides(data.animal.overrides)
      setSaveState('saved')
      setTimeout(() => setSaveState('idle'), 2000)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Speichern fehlgeschlagen')
      setSaveState('error')
    }
  }

  if (isLoading) return <p className="text-slate-500">Lädt …</p>
  if (!animal) return <p className="text-slate-500">Tier nicht gefunden.</p>

  return (
    <div className="max-w-2xl">
      <Link to="/admin/animals" className="text-sm text-slate-500 hover:underline">
        ← Zurück zur Liste
      </Link>
      <h1 className="mt-2 text-xl font-bold text-slate-900">{animal.title}</h1>

      {error && <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1 rounded-lg border border-slate-200 bg-white p-4 text-sm">
        <dt className="text-slate-500">Externe ID (Quelle)</dt>
        <dd>{animal.externalId}</dd>
        <dt className="text-slate-500">Art</dt>
        <dd>{categoryLabel(animal.category)}</dd>
        <dt className="text-slate-500">Zuletzt synchronisiert</dt>
        <dd>{animal.lastSyncedAt ? new Date(animal.lastSyncedAt).toLocaleString('de-AT') : 'nie'}</dd>
      </dl>

      <label className="mt-4 flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-4 text-sm">
        <input type="checkbox" checked={isHidden} onChange={(e) => setIsHidden(e.target.checked)} />
        Manuell ausblenden (unabhängig vom Status, taucht nicht im Swipe-Stapel auf)
      </label>

      <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-slate-700">Felder überschreiben</h2>
        <p className="mt-1 text-xs text-slate-500">
          Angehakte Felder haben beim nächsten Sync Vorrang vor den Daten aus der Quelle.
        </p>
        <div className="mt-2">
          {OVERRIDE_FIELDS.map((field) => (
            <OverrideField
              key={field.key}
              field={field}
              currentValue={(animal as unknown as Record<string, unknown>)[field.key]}
              overrideValue={overrides[field.key]}
              isOverridden={field.key in overrides}
              onToggle={() => toggleOverride(field.key, (animal as unknown as Record<string, unknown>)[field.key])}
              onChange={(value) => setOverrides((current) => ({ ...current, [field.key]: value }))}
            />
          ))}
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saveState === 'saving'}
        className="mt-4 rounded-md bg-slate-800 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-900 disabled:opacity-60"
      >
        {saveState === 'saving' ? 'Speichert …' : saveState === 'saved' ? 'Gespeichert ✓' : 'Speichern'}
      </button>
    </div>
  )
}
