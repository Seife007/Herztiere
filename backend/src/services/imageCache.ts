import { mkdir, readdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

// Faktor, um den das von der Quelle gelieferte Thumbnail (358x240px, siehe
// docs/data-source.md) beim Caching hochskaliert wird (Issue #9). Die Quelle
// liefert nachweislich keine höher aufgelöste Variante (recherchiert:
// weder zusätzliche RSS-Felder noch Resize-Query-Parameter noch EXIF-Daten
// liefern mehr Bilddetail) - Lanczos3-Upscaling erzeugt daher keine echten
// Zusatzdetails, sondern nur glattere Kanten/weniger sichtbare Pixel auf
// großen Bildschirmen (Nutzerentscheidung, Issue #9).
const UPSCALE_FACTOR = 2

// Eigenes Caching statt Hotlinking der Quelle (siehe Issue #3 / memory.md):
// die App bleibt so unabhängig von Verfügbarkeit/Ladezeit von wien.gv.at.
// Bilder liegen unter IMAGE_STORAGE_DIR (Default: storage/images) und werden
// unter /api/images/<externalId>.jpg ausgeliefert (siehe index.ts).

export const IMAGE_URL_PREFIX = '/api/images'

export function imageStorageDir(): string {
  return path.resolve(process.cwd(), process.env.IMAGE_STORAGE_DIR ?? 'storage/images')
}

function imageFileName(externalId: string): string {
  return `${externalId}.jpg`
}

export async function ensureImageStorageDir(): Promise<void> {
  await mkdir(imageStorageDir(), { recursive: true })
}

// Skaliert das Thumbnail per Lanczos3-Filter hoch (Issue #9). Schlägt die
// Verarbeitung fehl (z. B. unerwartetes Format), werden die Original-Bytes
// unverändert gespeichert - ein Problem hier darf den Sync-Lauf nicht
// abbrechen, genau wie beim Download selbst.
async function upscaleImage(bytes: Buffer): Promise<Buffer> {
  try {
    const image = sharp(bytes)
    const { width, height } = await image.metadata()
    if (!width || !height) return bytes

    return await image
      .resize({ width: width * UPSCALE_FACTOR, height: height * UPSCALE_FACTOR, kernel: 'lanczos3' })
      .jpeg({ quality: 90 })
      .toBuffer()
  } catch {
    return bytes
  }
}

// Lädt das Thumbnail für ein Tier herunter und speichert es lokal. Gibt bei
// Erfolg den servierten Pfad zurück, bei jedem Fehler `null` - ein einzelnes
// fehlgeschlagenes Bild darf den gesamten Sync-Lauf nicht abbrechen.
export async function downloadAnimalImage(
  externalId: string,
  sourceImagePath: string,
): Promise<string | null> {
  const baseUrl = process.env.FUNDTIERE_IMAGE_BASE_URL
  if (!baseUrl) return null

  try {
    const response = await fetch(new URL(sourceImagePath, baseUrl), {
      headers: { 'User-Agent': process.env.SYNC_USER_AGENT ?? 'herztiere/0.1' },
    })
    if (!response.ok) return null

    const bytes = Buffer.from(await response.arrayBuffer())
    const upscaled = await upscaleImage(bytes)
    await ensureImageStorageDir()
    await writeFile(path.join(imageStorageDir(), imageFileName(externalId)), upscaled)
    return `${IMAGE_URL_PREFIX}/${imageFileName(externalId)}`
  } catch {
    return null
  }
}

// Lädt Thumbnails für mehrere Tiere mit begrenzter Nebenläufigkeit herunter
// (rücksichtsvoll gegenüber der Quelle bei ~190 Einträgen pro Sync-Lauf).
export async function downloadAnimalImages(
  entries: Array<{ externalId: string; sourceImagePath: string | null }>,
  concurrency = 8,
): Promise<Map<string, string | null>> {
  const results = new Map<string, string | null>()
  let index = 0

  async function worker() {
    while (index < entries.length) {
      const entry = entries[index++]
      results.set(
        entry.externalId,
        entry.sourceImagePath ? await downloadAnimalImage(entry.externalId, entry.sourceImagePath) : null,
      )
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, entries.length) }, worker))
  return results
}

// Entfernt Bilddateien, für die es keine passende animals-Zeile mehr gibt
// (z. B. Reste eines fehlgeschlagenen früheren Laufs). Tiere mit Status
// "removed" behalten ihr Bild, solange die Zeile existiert (z. B. für die
// Merkliste), daher werden hier bewusst *alle* bekannten external_ids
// übergeben, nicht nur die aktiven.
export async function cleanupOrphanImages(validExternalIds: Set<string>): Promise<number> {
  await ensureImageStorageDir()
  const files = await readdir(imageStorageDir())
  let removed = 0
  for (const file of files) {
    const externalId = file.endsWith('.jpg') ? file.slice(0, -'.jpg'.length) : null
    if (externalId && !validExternalIds.has(externalId)) {
      await rm(path.join(imageStorageDir(), file))
      removed++
    }
  }
  return removed
}
