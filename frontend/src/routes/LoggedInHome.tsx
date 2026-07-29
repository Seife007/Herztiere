import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import type { Animal } from '../lib/types'

const ACTIONS = [
  { to: '/entdecken', icon: '💫', title: 'Weiterswipen', text: 'Entdecke weitere aktuelle Fundtiere.' },
  { to: '/merkliste', icon: '💌', title: 'Merkliste', text: 'Deine gemerkten Tiere ansehen.' },
  { to: '/konto', icon: '👤', title: 'Konto', text: 'Präferenzen & Kontoeinstellungen.' },
]

export function LoggedInHome() {
  const { user } = useAuth()
  const [likeCount, setLikeCount] = useState<number | null>(null)

  useEffect(() => {
    api
      .get<{ animals: Animal[] }>('/api/users/me/likes')
      .then((data) => setLikeCount(data.animals.length))
      .catch(() => setLikeCount(null))
  }, [])

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-4 py-12">
      <section className="text-center md:text-left">
        <h1 className="font-display text-3xl font-bold text-stone-800 md:text-4xl">
          Willkommen zurück{user ? `, ${user.email.split('@')[0]}` : ''} 👋
        </h1>
        <p className="mt-3 text-lg text-stone-600">
          {likeCount === null
            ? 'Schön, dass du wieder da bist.'
            : likeCount === 0
              ? 'Noch nichts gemerkt – wisch dich durch die aktuellen Fundtiere.'
              : `Du hast aktuell ${likeCount} ${likeCount === 1 ? 'Tier' : 'Tiere'} gemerkt.`}
        </p>
      </section>

      <section className="grid gap-6 sm:grid-cols-3">
        {ACTIONS.map((action) => (
          <Link
            key={action.to}
            to={action.to}
            className="flex flex-col items-center gap-2 rounded-3xl bg-white p-6 text-center shadow-md transition-transform hover:-translate-y-0.5 hover:shadow-lg"
          >
            <span className="text-4xl">{action.icon}</span>
            <h2 className="font-display text-xl font-bold text-stone-800">{action.title}</h2>
            <p className="text-stone-600">{action.text}</p>
          </Link>
        ))}
      </section>

      {user?.role === 'admin' && (
        <section className="text-center">
          <Link
            to="/admin"
            className="inline-block rounded-full border-2 border-coral-200 px-6 py-3 font-semibold text-coral-600 transition-colors hover:bg-coral-50"
          >
            ⚙️ Zum Admin-Bereich
          </Link>
        </section>
      )}
    </div>
  )
}
