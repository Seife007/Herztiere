import { describe, expect, it } from 'vitest'
import { parseFundtiereFeed } from './fundtiereFeed.js'

// Ausschnitt im echten Feed-Format (RSS 2.0, Namespaces cal/vcard/vie/media),
// siehe docs/data-source.md. Deckt ab: HTML-Entities, leeres <vie:mischling>
// vs. gesetztes, leeres <vie:geburtsjahr>, fehlendes <media:thumbnail>.
const SAMPLE_FEED = `<?xml version="1.0" encoding="UTF-8" ?>
<rss xmlns:cal="http://www.w3.org/2002/12/cal#" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:vcard="http://www.w3.org/2006/vcard/ns" xmlns:media="http://search.yahoo.com/mrss/" xmlns:vie="http://www.wien.gv.at/vierss" version="2.0">
<channel>
<title>Fundtiere wien.at</title>
<item>
	<title>Europ&#228;isch Kurzhaar</title>
	<description>02_Katzen</description>
	<guid isPermaLink="false">62912</guid>
	<dc:date>2026-07-28</dc:date>
	<vie:geburtsjahr>2022</vie:geburtsjahr>
	<vie:geschlecht>m&#228;nnlich</vie:geschlecht>
	<vie:farbe>wei&#223;-grau</vie:farbe>
	<vie:mischling></vie:mischling>
	<cal:location>
		<vcard:street-address>16., Gablenzgasse</vcard:street-address>
	</cal:location>
	<cal:organizer>
		<vcard:fn>TierQuarTier Wien,  1220 Wien, S&#252;&#223;enbrunner Stra&#223;e 101</vcard:fn>
		<vcard:tel>+43 1 734 11 02 - 114</vcard:tel>
		<vcard:email>tieraufnahme@tierquartier.at</vcard:email>
	</cal:organizer>
		<media:thumbnail url="/fundundvergabetiere/internet/Bild/Thumbnail/84485" />
</item>
<item>
	<title>Mischlingshund</title>
	<description>01_Hunde</description>
	<guid isPermaLink="false">62731</guid>
	<dc:date>2026-07-20</dc:date>
	<vie:geburtsjahr></vie:geburtsjahr>
	<vie:geschlecht>weiblich</vie:geschlecht>
	<vie:farbe>braun</vie:farbe>
	<vie:mischling>Mischling</vie:mischling>
	<cal:location>
		<vcard:street-address>16., Thaliastra&#223;e</vcard:street-address>
	</cal:location>
	<cal:organizer>
		<vcard:fn>TierQuarTier Wien</vcard:fn>
		<vcard:tel>+43 1 734 11 02</vcard:tel>
		<vcard:email>tieraufnahme@tierquartier.at</vcard:email>
	</cal:organizer>
</item>
</channel>
</rss>`

describe('parseFundtiereFeed', () => {
  it('parses all items in the feed', () => {
    expect(parseFundtiereFeed(SAMPLE_FEED)).toHaveLength(2)
  })

  it('decodes HTML entities and maps fields correctly', () => {
    const [cat] = parseFundtiereFeed(SAMPLE_FEED)
    expect(cat).toEqual({
      externalId: '62912',
      title: 'Europäisch Kurzhaar',
      category: '02_Katzen',
      foundDate: '2026-07-28',
      birthYear: 2022,
      gender: 'männlich',
      color: 'weiß-grau',
      isMixed: false,
      location: '16., Gablenzgasse',
      contactName: 'TierQuarTier Wien,  1220 Wien, Süßenbrunner Straße 101',
      contactPhone: '+43 1 734 11 02 - 114',
      contactEmail: 'tieraufnahme@tierquartier.at',
      sourceImagePath: '/fundundvergabetiere/internet/Bild/Thumbnail/84485',
    })
  })

  it('treats a non-empty vie:mischling as isMixed=true, empty birth year as null, missing thumbnail as null', () => {
    const [, dog] = parseFundtiereFeed(SAMPLE_FEED)
    expect(dog.isMixed).toBe(true)
    expect(dog.birthYear).toBeNull()
    expect(dog.sourceImagePath).toBeNull()
  })

  it('returns an empty array for a feed with no items', () => {
    expect(parseFundtiereFeed('<rss><channel><title>Empty</title></channel></rss>')).toEqual([])
  })
})
