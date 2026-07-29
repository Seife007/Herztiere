import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { TextField } from '../components/TextField'

const SPECIES_OPTIONS = [
  { value: '01_Hunde', label: '🐶 Hunde' },
  { value: '02_Katzen', label: '🐱 Katzen' },
  { value: '03_Andere Tiere', label: '🐹 Andere Tiere' },
]

const EXPERIENCE_OPTIONS = [
  { value: 'keine', label: 'Noch keine' },
  { value: 'etwas', label: 'Etwas Erfahrung' },
  { value: 'erfahren', label: 'Erfahren' },
] as const

export function Account() {
  const { user, updatePreferences, deleteAccount } = useAuth()
  const navigate = useNavigate()

  const [speciesInterest, setSpeciesInterest] = useState<string[]>(user?.preferences.speciesInterest ?? [])
  const [experienceLevel, setExperienceLevel] = useState<(typeof EXPERIENCE_OPTIONS)[number]['value']>(
    user?.preferences.experienceLevel ?? 'keine',
  )
  const [housingSituation, setHousingSituation] = useState(user?.preferences.housingSituation ?? '')
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle')

  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  if (!user) return null

  function toggleSpecies(value: string) {
    setSpeciesInterest((current) =>
      current.includes(value) ? current.filter((v) => v !== value) : [...current, value],
    )
  }

  async function handleSave() {
    setSaveState('saving')
    await updatePreferences({ speciesInterest, experienceLevel, housingSituation })
    setSaveState('saved')
    setTimeout(() => setSaveState('idle'), 2000)
  }

  async function handleDelete() {
    setIsDeleting(true)
    await deleteAccount()
    navigate('/')
  }

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
      <h1 className="font-display text-3xl font-bold text-stone-800">Dein Konto</h1>

      <div className="mt-6 rounded-3xl bg-white p-6 shadow-md sm:p-8">
        <TextField label="E-Mail" name="email" value={user.email} disabled readOnly />

        <fieldset className="mt-6 flex flex-col gap-2">
          <legend className="text-sm font-semibold text-stone-700">Woran hast du Interesse?</legend>
          <div className="flex flex-wrap gap-2">
            {SPECIES_OPTIONS.map((option) => (
              <button
                type="button"
                key={option.value}
                onClick={() => toggleSpecies(option.value)}
                className={`rounded-full border-2 px-4 py-2 text-sm font-semibold transition-colors ${
                  speciesInterest.includes(option.value)
                    ? 'border-coral-500 bg-coral-500 text-white'
                    : 'border-stone-200 text-stone-600 hover:border-coral-300'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="mt-6 flex flex-col gap-2">
          <legend className="text-sm font-semibold text-stone-700">Erfahrung mit Tieren?</legend>
          <div className="flex flex-wrap gap-2">
            {EXPERIENCE_OPTIONS.map((option) => (
              <button
                type="button"
                key={option.value}
                onClick={() => setExperienceLevel(option.value)}
                className={`rounded-full border-2 px-4 py-2 text-sm font-semibold transition-colors ${
                  experienceLevel === option.value
                    ? 'border-coral-500 bg-coral-500 text-white'
                    : 'border-stone-200 text-stone-600 hover:border-coral-300'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="mt-6">
          <TextField
            label="Wohnsituation (optional)"
            name="housingSituation"
            maxLength={200}
            value={housingSituation}
            onChange={(e) => setHousingSituation(e.target.value)}
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saveState === 'saving'}
          className="mt-6 rounded-full bg-coral-500 px-6 py-2.5 font-semibold text-white shadow-sm hover:bg-coral-600 disabled:opacity-60"
        >
          {saveState === 'saving' ? 'Speichert …' : saveState === 'saved' ? 'Gespeichert ✓' : 'Änderungen speichern'}
        </button>
      </div>

      <div className="mt-8 rounded-3xl border-2 border-red-100 bg-white p-6 shadow-md sm:p-8">
        <h2 className="font-display text-xl font-bold text-red-600">Konto löschen</h2>
        <p className="mt-2 text-sm text-stone-600">
          Dein Konto sowie deine Merkliste werden unwiderruflich gelöscht. Diese Aktion kann nicht rückgängig
          gemacht werden.
        </p>

        {!confirmingDelete ? (
          <button
            onClick={() => setConfirmingDelete(true)}
            className="mt-4 rounded-full border-2 border-red-200 px-6 py-2.5 font-semibold text-red-600 hover:bg-red-50"
          >
            Konto löschen
          </button>
        ) : (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <p className="font-semibold text-stone-800">Wirklich unwiderruflich löschen?</p>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="rounded-full bg-red-600 px-5 py-2 font-semibold text-white hover:bg-red-700 disabled:opacity-60"
            >
              {isDeleting ? 'Löscht …' : 'Ja, endgültig löschen'}
            </button>
            <button
              onClick={() => setConfirmingDelete(false)}
              className="rounded-full border-2 border-stone-200 px-5 py-2 font-semibold text-stone-600 hover:bg-stone-50"
            >
              Abbrechen
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
