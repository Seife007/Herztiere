# Datenquelle: Fundtiere Wien (data.gv.at)

Recherche-Ergebnis für Issue #1. Ausschließlich diese Quelle darf verwendet werden.

## Katalogeintrag

- data.gv.at Katalogseite: https://www.data.gv.at/katalog/dataset/dcb4ba1d-94c6-48b9-82c9-e315bd0e8f31
- Datensatzname: "Fundtiere Wien"
- Herausgeber: Stadt Wien (MA 60 – Veterinärdienste und Tierschutz)
- Lizenz: **CC BY 4.0** (Creative Commons Namensnennung 4.0)
- Empfohlene Namensnennung: "Datenquelle: Stadt Wien – data.gv.at, Lizenz: CC BY 4.0"

Die data.gv.at-Katalogseite selbst ist eine clientseitig gerenderte SPA ohne stabil dokumentiertes REST-API für die Metadaten (mehrere klassische CKAN-API-Pfade wurden geprüft, keiner lieferte Daten). Die tatsächliche Ressourcen-URL wurde stattdessen über die **data.europa.eu Hub-Search-API** ermittelt (`https://data.europa.eu/api/hub/search/search?q=Fundtiere+Wien`), die den Datensatz von data.gv.at harvestet und die Distributions-URLs mit auflistet.

## Tatsächliche Datenquelle (Distribution)

- **URL:** `https://www.wien.gv.at/fundundvergabetiere/internet/rssfeed.xml`
- **Format:** RSS 2.0 (XML), nicht CSV/JSON
- **Lizenz laut Distribution:** CC BY 4.0 (`https://creativecommons.org/licenses/by/4.0/deed.de`)
- **Zugriffsmethode:** einfacher HTTP-GET, kein API-Key nötig
- **Umfang (Stichprobe 2026-07-28):** 188 Einträge, keine Paginierung – der komplette aktuelle Bestand liegt in einem Response
- **Update-Frequenz:** nicht offiziell dokumentiert. Die Aufgabenstellung (4x täglich synchronisieren) ist eine sinnvolle, konservative Wahl angesichts der Natur der Daten (Fundtiere ändern sich nicht im Minutentakt); sollte im Betrieb beobachtet und ggf. angepasst werden.
- Es gibt **keine stabile Detailseiten-URL pro Tier** – als `source_url` wird daher die Feed-URL selbst gespeichert, die genaue Zuordnung erfolgt über `external_id` (= RSS `<guid>`).

### Feld-Mapping (RSS → `animals`-Tabelle)

| RSS-Feld | Beispiel | DB-Spalte | Anmerkung |
|---|---|---|---|
| `<guid isPermaLink="false">` | `62912` | `external_id` | eindeutig, stabil über die Verweildauer im Feed |
| `<title>` | `Europäisch Kurzhaar` | `title` | oft Rasse (bei Katzen/Hunden) oder direkt die Art (z. B. `Meerschweinchen`) |
| `<description>` | `02_Katzen` | `category` | Kategorie-Code, beobachtete Werte: `01_Hunde`, `02_Katzen`, `03_Andere Tiere` |
| `dc:date` | `2026-07-28` | `found_date` | Datum der Kundmachung/Fund |
| `vie:geburtsjahr` | `2022` (oder leer) | `birth_year` | optional, oft leer |
| `vie:geschlecht` | `männlich` / `weiblich` / `unbekannt` | `gender` | |
| `vie:farbe` | `weiß-grau` | `color` | Freitext |
| `vie:mischling` | leer oder `Mischling` | `is_mixed` | Präsenz des Texts = `true` |
| `cal:location > vcard:street-address` | `16., Gablenzgasse` | `location` | Fundort, Freitext |
| `cal:organizer > vcard:fn` | `TierQuarTier Wien, 1220 Wien, Süßenbrunner Straße 101` | `contact_name` | zuständige Stelle – **nicht generisch "Tierheim"**, wie in Issue #4 gefordert |
| `cal:organizer > vcard:tel` | `+43 1 734 11 02 - 114` | `contact_phone` | |
| `cal:organizer > vcard:email` | `tieraufnahme@tierquartier.at` | `contact_email` | |
| `media:thumbnail@url` | `/fundundvergabetiere/internet/Bild/Thumbnail/84485` | `image_url` | **relativer Pfad** – muss mit `FUNDTIERE_IMAGE_BASE_URL` (`https://www.wien.gv.at`) zusammengesetzt werden. Getestet und erreichbar (HTTP 200, JPEG). Eine Vollbild-Variante ohne `/Thumbnail/` existiert nicht (404) – es steht nur die Thumbnail-Auflösung zur Verfügung. |

Beobachtete Werte für `cal:organizer > vcard:fn` (= zuständige Stellen) in der Stichprobe:
- `Stadt Wien | Veterinäramt und Tierschutz`
- `TierQuarTier Wien, 1220 Wien, Süßenbrunner Straße 101`
- `Zoo Forchtenstein, 1140 Wien`

### Verhalten bei "verschwundenen" Einträgen

Es gibt kein explizites Status-Feld im Feed. Ein Tier gilt als nicht mehr verfügbar, sobald sein `<guid>` in einem Sync-Lauf nicht mehr im Feed enthalten ist (Vermittlung, Fristablauf o. Ä.). Das entspricht genau der in Issue #3 geforderten Merge-Logik: nicht mehr vorhandene Einträge werden auf `status = 'removed'` gesetzt statt hart gelöscht (wegen bestehender Merklisten-Referenzen).

## Offene Punkte für Issue #3

- Genaue Update-Frequenz der Quelle selbst ist unbekannt; 4x täglich ist ein sinnvoller, aber nicht garantiert optimaler Wert.
- Bild-Handling: Empfehlung laut Issue #3 ist eigenes Caching der Bilder statt Hotlinking. Die Thumbnail-URLs unter `wien.gv.at` sind zwar aktuell erreichbar, aber nicht Teil eines dokumentierten stabilen API-Vertrags.
