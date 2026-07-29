import { useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api, ApiError } from '../lib/api'
import { TextField } from '../components/TextField'

export function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

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
      await api.post('/api/auth/reset-password', { token, password })
      setSuccess(true)
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Der Link ist ungültig oder abgelaufen. Bitte fordere einen neuen an.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12">
      <div className="rounded-3xl bg-white p-8 shadow-lg shadow-coral-100/50">
        <h1 className="text-center font-display text-3xl font-bold text-stone-800">Neues Passwort</h1>

        {!token && (
          <p className="mt-4 rounded-2xl bg-red-50 p-4 text-center text-red-600">
            Dieser Link ist unvollständig. Bitte fordere einen neuen Reset-Link an.
          </p>
        )}

        {success ? (
          <div className="mt-6 text-center">
            <p className="rounded-2xl bg-coral-50 p-4 text-stone-700">Dein Passwort wurde geändert.</p>
            <Link
              to="/login"
              className="mt-4 inline-block rounded-full bg-coral-500 px-6 py-3 font-semibold text-white shadow-md shadow-coral-200 hover:bg-coral-600"
            >
              Jetzt anmelden
            </Link>
          </div>
        ) : (
          token && (
            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
              <TextField
                label="Neues Passwort"
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
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 rounded-full bg-coral-500 px-6 py-3 font-semibold text-white shadow-md shadow-coral-200 transition-colors hover:bg-coral-600 disabled:opacity-60"
              >
                {isSubmitting ? 'Einen Moment …' : 'Passwort ändern'}
              </button>
            </form>
          )
        )}
      </div>
    </div>
  )
}
