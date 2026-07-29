export interface Preferences {
  speciesInterest: string[]
  experienceLevel?: 'keine' | 'etwas' | 'erfahren'
  housingSituation?: string
}

export interface User {
  id: string
  email: string
  role: 'user' | 'admin'
  isBlocked: boolean
  preferences: Preferences
  createdAt: string
}

export interface Animal {
  id: string
  title: string
  category: string
  breed: string | null
  gender: string | null
  color: string | null
  birthYear: number | null
  isMixed: boolean
  description: string | null
  location: string | null
  foundDate: string | null
  contactName: string | null
  contactPhone: string | null
  contactEmail: string | null
  imageUrl: string | null
  cachedImagePath: string | null
  status: 'active' | 'adopted' | 'removed'
  sourceUrl: string
  isLiked: boolean
}

export interface AdminUser extends User {
  likeCount: number
}

export interface AdminAnimal extends Animal {
  externalId: string
  manuallyEdited: boolean
  isHidden: boolean
  lastSyncedAt: string | null
  overrides: Record<string, unknown>
}

export interface SyncRun {
  id: string
  startedAt: string
  finishedAt: string | null
  status: 'running' | 'success' | 'error'
  createdCount: number
  updatedCount: number
  removedCount: number
  errorMessage: string | null
  triggeredBy: string
}
