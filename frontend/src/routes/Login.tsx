import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ApiError } from '../lib/api'
import { TextField } from '../components/TextField'

export function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      await login(email, password)
      const from = (location.state as { from?: string } | null)?.from
      navigate(from ?? '/entdecken')
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        setError('Dieses Konto wurde gesperrt.')
      } else {
        setError('E-Mail oder Passwort ist falsch.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12">
      <div className="rounded-3xl bg-white p-8 shadow-lg shadow-coral-100/50">
        <h1 className="text-center font-display text-3xl font-bold text-stone-800">Willkommen zurück</h1>

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
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 rounded-full bg-coral-500 px-6 py-3 font-semibold text-white shadow-md shadow-coral-200 transition-colors hover:bg-coral-600 disabled:opacity-60"
          >
            {isSubmitting ? 'Einen Moment …' : 'Anmelden'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm">
          <Link to="/passwort-vergessen" className="text-coral-600 hover:underline">
            Passwort vergessen?
          </Link>
        </p>
        <p className="mt-2 text-center text-sm text-stone-500">
          Noch kein Konto?{' '}
          <Link to="/registrieren" className="font-semibold text-coral-600 hover:underline">
            Jetzt registrieren
          </Link>
        </p>
      </div>
    </div>
  )
}
