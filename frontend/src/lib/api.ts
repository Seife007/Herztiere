// Standardmäßig leer (= relative Pfade wie `/api/...`), damit Requests immer
// an denselben Host/Port gehen, über den die Seite selbst geladen wurde -
// funktioniert dadurch unabhängig von der jeweiligen IP/dem Hostnamen
// (LAN, localhost, öffentliche IP per Portweiterleitung, ...), siehe
// `vite.config.ts` für den zugehörigen /api-Proxy zum Backend (Issue #12).
// `VITE_API_URL` bleibt als expliziter Override möglich, falls Frontend und
// Backend ausnahmsweise ohne gemeinsamen Proxy auf getrennten Hosts laufen.
const API_BASE_URL = import.meta.env.VITE_API_URL ?? ''

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    headers:
      options.body !== undefined ? { 'Content-Type': 'application/json', ...options.headers } : options.headers,
    ...options,
  })

  if (response.status === 204) {
    return undefined as T
  }

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new ApiError(data?.error ?? 'Ein Fehler ist aufgetreten', response.status)
  }

  return data as T
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: body !== undefined ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}

// Für Bild-Pfade, die das Backend relativ ausliefert (/api/images/...).
export function resolveImageUrl(path: string | null): string | null {
  if (!path) return null
  return path.startsWith('/') ? `${API_BASE_URL}${path}` : path
}
