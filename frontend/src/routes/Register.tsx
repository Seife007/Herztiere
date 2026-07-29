import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ApiError } from '../lib/api'
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

export function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [speciesInterest, setSpeciesInterest] = useState<string[]>([])
  const [experienceLevel, setExperienceLevel] = useState<(typeof EXPERIENCE_OPTIONS)[number]['value']>('keine')
  const [housingSituation, setHousingSituation] = useState('')

  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function toggleSpecies(value: string) {
    setSpeciesInterest((current) =>
      current.includes(value) ? current.filter((v) => v !== value) : [...current, value],
    )
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)

    if (password.length < 10) {
      setError('Das Passwort muss mindestens 10 Zeichen lang sein.')
      return
    }
    if (password !== confirmPassword) {
      setError('Die Passwörter stimmen nicht überein.')
      return
    }

    setIsSubmitting(true)
    try {
      await register(email, password, { speciesInterest, experienceLevel, housingSituation })
      navigate('/entdecken')
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError('Für diese E-Mail-Adresse besteht bereits ein Konto.')
      } else {
        setError('Registrierung fehlgeschlagen. Bitte überprüfe deine Eingaben.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12">
      <div className="rounded-3xl bg-white p-8 shadow-lg shadow-coral-100/50">
        <h1 className="text-center font-display text-3xl font-bold text-stone-800">Willkommen bei herztiere</h1>
        <p className="mt-2 text-center text-stone-500">Erzähl uns kurz von dir, dann geht's los.</p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <TextField
            label="E-Mail"
            type="email"
            name="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Passwort"
            type="password"
            name="password"
            autoComplete="new-password"
            required
            minLength={10}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <TextField
            label="Passwort bestätigen"
            type="password"
            name="confirmPassword"
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <fieldset className="flex flex-col gap-2">
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

          <fieldset className="flex flex-col gap-2">
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

          <TextField
            label="Wohnsituation (optional)"
            name="housingSituation"
            placeholder="z. B. Wohnung mit Garten"
            maxLength={200}
            value={housingSituation}
            onChange={(e) => setHousingSituation(e.target.value)}
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 rounded-full bg-coral-500 px-6 py-3 font-semibold text-white shadow-md shadow-coral-200 transition-colors hover:bg-coral-600 disabled:opacity-60"
          >
            {isSubmitting ? 'Einen Moment …' : 'Konto erstellen'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-stone-500">
          Schon dabei?{' '}
          <Link to="/login" className="font-semibold text-coral-600 hover:underline">
            Anmelden
          </Link>
        </p>
      </div>
    </div>
  )
}
