import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import { TextField } from '../components/TextField'

export function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setIsSubmitting(true)
    try {
      const data = await api.post<{ message: string }>('/api/auth/forgot-password', { email })
      setMessage(data.message)
    } catch {
      setMessage('Falls ein Konto mit dieser E-Mail existiert, wurde eine Reset-Mail versendet.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12">
      <div className="rounded-3xl bg-white p-8 shadow-lg shadow-coral-100/50">
        <h1 className="text-center font-display text-3xl font-bold text-stone-800">Passwort vergessen</h1>
        <p className="mt-2 text-center text-stone-500">
          Wir schicken dir einen Link zum Zurücksetzen, falls ein Konto mit dieser E-Mail existiert.
        </p>

        {message ? (
          <p className="mt-6 rounded-2xl bg-coral-50 p-4 text-center text-stone-700">{message}</p>
        ) : (
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
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 rounded-full bg-coral-500 px-6 py-3 font-semibold text-white shadow-md shadow-coral-200 transition-colors hover:bg-coral-600 disabled:opacity-60"
            >
              {isSubmitting ? 'Einen Moment …' : 'Link anfordern'}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-stone-500">
          <Link to="/login" className="font-semibold text-coral-600 hover:underline">
            Zurück zum Login
          </Link>
        </p>
      </div>
    </div>
  )
}
