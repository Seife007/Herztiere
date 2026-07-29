import cron from 'node-cron'
import { runSync } from './sync.js'

// 4x täglich, siehe Issue #3 (Update-Frequenz der Quelle selbst unbekannt,
// siehe docs/data-source.md - konservative, im Betrieb ggf. anzupassende Wahl).
const SYNC_CRON_EXPRESSION = '0 0,6,12,18 * * *'

export function startSyncScheduler(): void {
  cron.schedule(SYNC_CRON_EXPRESSION, async () => {
    try {
      await runSync('schedule')
    } catch (error) {
      console.error('Geplanter Sync-Lauf fehlgeschlagen:', error)
    }
  })
}
