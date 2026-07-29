import { XMLParser } from 'fast-xml-parser'

// Datenquelle: Fundtiere Wien (Stadt Wien), CC BY 4.0, siehe docs/data-source.md
// Feld-Mapping RSS -> FeedAnimal ist dort dokumentiert.

export interface FeedAnimal {
  externalId: string
  title: string
  category: string
  foundDate: string | null
  birthYear: number | null
  gender: string | null
  color: string | null
  isMixed: boolean
  location: string | null
  contactName: string | null
  contactPhone: string | null
  contactEmail: string | null
  sourceImagePath: string | null
}

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  textNodeName: '#text',
  htmlEntities: true,
})

function textOrNull(value: unknown): string | null {
  if (value === undefined || value === null) return null
  const text = String(value).trim()
  return text.length > 0 ? text : null
}

// RSS-Item-Felder können bei fehlendem Wert als leerer String, fehlendes
// Kind-Objekt oder (bei rein numerischem Inhalt) als Zahl geparst werden -
// alle drei Fälle müssen abgefangen werden.
function parseItem(item: Record<string, unknown>): FeedAnimal | null {
  const guidRaw = item.guid as { '#text'?: unknown } | string | number | undefined
  const externalId =
    guidRaw && typeof guidRaw === 'object' ? textOrNull(guidRaw['#text']) : textOrNull(guidRaw)
  if (!externalId) return null

  const title = textOrNull(item.title)
  const category = textOrNull(item.description)
  if (!title || !category) return null

  const location = item['cal:location'] as Record<string, unknown> | undefined
  const organizer = item['cal:organizer'] as Record<string, unknown> | undefined
  const thumbnail = item['media:thumbnail'] as Record<string, unknown> | undefined

  const birthYearText = textOrNull(item['vie:geburtsjahr'])
  const birthYear = birthYearText ? Number.parseInt(birthYearText, 10) : null

  return {
    externalId,
    title,
    category,
    foundDate: textOrNull(item['dc:date']),
    birthYear: birthYear !== null && !Number.isNaN(birthYear) ? birthYear : null,
    gender: textOrNull(item['vie:geschlecht']),
    color: textOrNull(item['vie:farbe']),
    isMixed: textOrNull(item['vie:mischling']) !== null,
    location: location ? textOrNull(location['vcard:street-address']) : null,
    contactName: organizer ? textOrNull(organizer['vcard:fn']) : null,
    contactPhone: organizer ? textOrNull(organizer['vcard:tel']) : null,
    contactEmail: organizer ? textOrNull(organizer['vcard:email']) : null,
    sourceImagePath: thumbnail ? textOrNull(thumbnail['@_url']) : null,
  }
}

export function parseFundtiereFeed(xml: string): FeedAnimal[] {
  const parsed = parser.parse(xml)
  const rawItems = parsed?.rss?.channel?.item
  const items: Record<string, unknown>[] = Array.isArray(rawItems)
    ? rawItems
    : rawItems
      ? [rawItems]
      : []

  return items
    .map(parseItem)
    .filter((animal): animal is FeedAnimal => animal !== null)
}

export async function fetchFundtiereFeed(): Promise<FeedAnimal[]> {
  const feedUrl = process.env.FUNDTIERE_FEED_URL
  if (!feedUrl) {
    throw new Error('FUNDTIERE_FEED_URL ist nicht konfiguriert')
  }

  const response = await fetch(feedUrl, {
    headers: { 'User-Agent': process.env.SYNC_USER_AGENT ?? 'herztiere/0.1' },
  })
  if (!response.ok) {
    throw new Error(`Fundtiere-Feed antwortete mit Status ${response.status}`)
  }

  return parseFundtiereFeed(await response.text())
}
