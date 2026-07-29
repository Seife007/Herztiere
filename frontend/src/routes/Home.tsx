import { useAuth } from '../context/AuthContext'
import { Landing } from './Landing'
import { LoggedInHome } from './LoggedInHome'

export function Home() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-cream-50 text-stone-500">
        Lädt …
      </div>
    )
  }

  return user ? <LoggedInHome /> : <Landing />
}
