import type { ReactNode } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function NavLinkItem({ to, icon, label }: { to: string; icon: string; label: string }) {
  return (
    <NavLink
      to={to}
      aria-label={label}
      className={({ isActive }) =>
        `rounded-full px-2.5 py-2 text-sm font-semibold transition-colors sm:px-4 ${
          isActive ? 'bg-coral-500 text-white' : 'text-stone-600 hover:bg-coral-50 hover:text-coral-600'
        }`
      }
    >
      <span aria-hidden="true">{icon}</span>
      <span className="hidden sm:inline" aria-hidden="true">
        {' '}
        {label}
      </span>
    </NavLink>
  )
}

export function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/')
  }

  return (
    <div className="flex min-h-svh flex-col overflow-x-hidden bg-cream-50">
      <header className="sticky top-0 z-10 border-b border-coral-100 bg-cream-50/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-3 py-3 sm:gap-4 sm:px-4">
          <Link to="/" className="shrink-0 font-display text-xl font-bold text-coral-600 sm:text-2xl">
            🐾 <span className="hidden sm:inline">herztiere</span>
          </Link>
          <nav className="flex items-center gap-0.5 sm:gap-1">
            {user ? (
              <>
                <NavLinkItem to="/entdecken" icon="💫" label="Entdecken" />
                <NavLinkItem to="/merkliste" icon="💌" label="Merkliste" />
                <NavLinkItem to="/konto" icon="👤" label="Konto" />
                {user.role === 'admin' && <NavLinkItem to="/admin" icon="⚙️" label="Admin" />}
                <button
                  onClick={handleLogout}
                  aria-label="Abmelden"
                  className="rounded-full px-2.5 py-2 text-sm font-semibold text-stone-500 hover:bg-stone-100 sm:px-4"
                >
                  <span aria-hidden="true">🚪</span>
                  <span className="hidden sm:inline"> Abmelden</span>
                </button>
              </>
            ) : (
              <>
                <NavLinkItem to="/login" icon="🔑" label="Login" />
                <Link
                  to="/registrieren"
                  className="rounded-full bg-coral-500 px-3 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-coral-600 sm:px-4"
                >
                  <span className="sm:hidden">Mitmachen</span>
                  <span className="hidden sm:inline">Jetzt mitmachen</span>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="flex flex-1 flex-col">{children}</main>

      <footer className="border-t border-coral-100 px-4 py-6 text-center text-xs text-stone-400">
        <p>
          Datenquelle: Stadt Wien – data.gv.at, Lizenz{' '}
          <a
            href="https://creativecommons.org/licenses/by/4.0/deed.de"
            target="_blank"
            rel="noreferrer"
            className="underline hover:text-coral-500"
          >
            CC BY 4.0
          </a>
          . herztiere vermittelt selbst keine Tiere – Kontaktaufnahme erfolgt über die jeweils zuständige Stelle.
        </p>
      </footer>
    </div>
  )
}
