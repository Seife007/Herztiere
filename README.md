# herztiere

Eine Web-App, die Fundtiere der Stadt Wien (offene Daten von data.gv.at) als Swipe-Ansicht präsentiert – "Tinder für Fundtiere". Nutzer:innen können sich registrieren, durch aktuelle Fundtiere swipen, Favoriten merken und Details inkl. zuständiger Kontaktstelle einsehen. Ein Admin-Bereich verwaltet Nutzer:innen und Tierdaten.

Die App vermittelt selbst keine Tiere – sie zeigt öffentliche Fundtier-Daten an; Kontaktaufnahme und Vermittlung erfolgen über die jeweils zuständige Stelle (siehe Tierdetailseite).

## Tech-Stack

- **Frontend:** React (Vite) + TypeScript + Tailwind CSS
- **Backend:** Node.js + Express + TypeScript
- **Datenbank:** PostgreSQL
- **Lokale Ausführung:** docker-compose

## Datenquelle

Ausschließlich der Datensatz **"Fundtiere Wien"** von data.gv.at (Stadt Wien), Lizenz **CC BY 4.0**. Details zur recherchierten Struktur, Feldern und der tatsächlichen Ressourcen-URL siehe [`docs/data-source.md`](./docs/data-source.md).

**Lizenzhinweis-Pflicht:** Da die Daten unter CC BY 4.0 stehen, muss die Namensnennung "Datenquelle: Stadt Wien – data.gv.at, Lizenz: CC BY 4.0" im Footer der App sowie auf jeder Tierdetailseite sichtbar sein (siehe Issue #4).

## Setup

1. `.env.example` nach `.env` kopieren und Werte anpassen (siehe Kommentare in der Datei für Erklärungen der einzelnen Variablen).
2. Mit Docker: `docker compose up --build`
   - Backend: http://localhost:3000
   - Frontend: http://localhost:5173
   - Postgres: Port `5432` (Zugangsdaten aus `.env`)
3. Datenbank-Migrationen laufen manuell im Backend-Container/-Verzeichnis: `npm run migrate` (im `backend/`-Ordner, `DATABASE_URL` muss gesetzt sein).

### Ohne Docker (lokal)

```
# Backend
cd backend
npm install
npm run migrate   # DB muss erreichbar sein (DATABASE_URL in .env)
npm run dev

# Frontend (separates Terminal)
cd frontend
npm install
npm run dev
```

### Lokales HTTPS (optional, Issue #11)

Standardmäßig läuft der Frontend-Dev-Server per HTTP. Für HTTPS (z. B. um auf dem Handy ohne "unsicher"-Warnung zu testen, oder für Browser-APIs, die einen sicheren Kontext verlangen):

1. [`mkcert`](https://github.com/FiloSottile/mkcert) installieren.
2. Lokale CA installieren: `mkcert -install` (fügt sie in den System-/Browser-Trust-Store ein – benötigt ggf. root bzw. `libnss3-tools`/`certutil` für Chrome/Firefox; ohne das erzeugt `mkcert` das Zertifikat trotzdem, Browser zeigen dann aber eine Zertifikatswarnung, bis die Root-CA manuell importiert wird, z. B. über `$(mkcert -CAROOT)/rootCA.pem`).
3. Zertifikat erzeugen, gültig für alle Hosts, über die das Frontend erreichbar sein soll (mindestens `localhost`, bei Bedarf LAN-/Tailscale-IP ergänzen):
   ```
   mkdir -p frontend/certs
   mkcert -cert-file frontend/certs/dev-cert.pem -key-file frontend/certs/dev-key.pem localhost 127.0.0.1 <weitere-IPs>
   ```
4. Frontend (neu) starten – `vite.config.ts` erkennt die Dateien automatisch und aktiviert HTTPS; ohne die Dateien läuft weiterhin HTTP. `frontend/certs/` ist gitignored (private Schlüssel, nie committen).

Nur das Frontend braucht HTTPS: Der `/api`-Proxy zum Backend läuft weiterhin per HTTP, da dieser Hop serverseitig zwischen Vite und dem Backend stattfindet und den Browser nie erreicht (siehe Issue #12) – kein Mixed-Content-Problem.

### Umgebungsvariablen

Alle Variablen liegen mit Erklärung als Kommentar auch direkt in [`.env.example`](./.env.example). Kurzübersicht:

| Variable | Bedeutung |
|---|---|
| `POSTGRES_USER`/`POSTGRES_PASSWORD`/`POSTGRES_DB`/`POSTGRES_PORT` | Zugangsdaten für den Postgres-Container (nur relevant, wenn `db` per docker-compose läuft) |
| `DATABASE_URL` | Connection-String des Backends zur DB – bei lokaler Ausführung ohne Docker `localhost`, innerhalb von docker-compose der Servicename `db` |
| `PORT` | Port, auf dem das Backend lauscht (Default `3000`) |
| `CORS_ORIGIN` | Kommagetrennte Liste erlaubter Frontend-Origins |
| `JWT_SECRET` | Signierschlüssel für die Auth-JWTs im httpOnly-Cookie – muss ein langer, zufälliger String sein |
| `SEED_ADMIN_EMAIL`/`SEED_ADMIN_PASSWORD` | E-Mail/Passwort für `npm run seed:admin` (siehe unten) |
| `PASSWORD_RESET_TOKEN_TTL_MINUTES` | Gültigkeitsdauer eines "Passwort vergessen"-Links in Minuten |
| `FRONTEND_URL` | Basis-URL des Frontends, wird für den Link in der (aktuell nur geloggten) Reset-Mail verwendet |
| `FUNDTIERE_FEED_URL`/`FUNDTIERE_IMAGE_BASE_URL` | RSS-Feed-URL bzw. Basis-URL für Bild-Pfade der Datenquelle (siehe `docs/data-source.md`) |
| `SYNC_USER_AGENT` | User-Agent-Header beim Abruf von Feed/Bildern (Kontakt-Mailadresse für die Quelle) |
| `IMAGE_STORAGE_DIR` | Verzeichnis für lokal gecachte Tier-Thumbnails, relativ zum Arbeitsverzeichnis des Backend-Prozesses |
| `VITE_API_URL` | Optionaler Override, falls Frontend und Backend ausnahmsweise ohne gemeinsamen Proxy auf getrennten Hosts laufen. Standardmäßig **nicht gesetzt** – das Frontend nutzt dann relative `/api/...`-Pfade, die vom Vite-Dev-Server-Proxy ans Backend weitergereicht werden (siehe `BACKEND_URL`) und funktioniert dadurch unabhängig davon, über welche IP/welchen Host es aufgerufen wird (Issue #12) |
| `BACKEND_URL` | Ziel des Vite-Dev-Server-Proxys (`/api` → Backend), rein serverseitig, nie im Browser sichtbar. Lokal ohne Docker `http://localhost:3000`, innerhalb von docker-compose `http://backend:3000` |

### Ersten Admin-Account anlegen

`SEED_ADMIN_EMAIL` und `SEED_ADMIN_PASSWORD` in `.env` setzen, dann im `backend/`-Ordner:

```
npm run seed:admin
```

Legt den Account als `admin` an bzw. befördert einen bestehenden User mit dieser E-Mail zu `admin`. Es gibt keinen Weg, sich über die normale Registrierung selbst zum Admin zu machen.

### Tests

```
cd backend && npm test    # vitest, u. a. Business-/Sicherheitsregeln (z. B. Override-Merge, Schutz des letzten Admins) und Validierung
cd frontend && npm test   # vitest, reine Hilfsfunktionen (z. B. Label-/Datumsformatierung)
```

Unit-Tests decken bewusst nur DB-/IO-freie Logik ab. Echte End-to-End-Flows (Migrationen, API, Browser) werden stattdessen live gegen eine temporäre lokale Postgres-Instanz getestet, siehe `CLAUDE.md`.

## Auth-API (Issue #2)

Authentifizierung läuft über ein JWT in einem httpOnly-Cookie (kein Zugriff per JS, daher kein Speichern im Frontend nötig).

| Endpunkt | Beschreibung |
|---|---|
| `POST /api/auth/register` | `{ email, password, preferences? }` |
| `POST /api/auth/login` | `{ email, password }` |
| `POST /api/auth/logout` | löscht das Auth-Cookie |
| `POST /api/auth/forgot-password` | `{ email }` – immer generische Antwort (kein E-Mail-Enumeration) |
| `POST /api/auth/reset-password` | `{ token, password }` |
| `GET /api/users/me` | angemeldeter User |
| `PATCH /api/users/me` | `{ preferences }` |
| `GET /api/users/me/export` | DSGVO-Datenexport (Art. 15/20): Konto + Merkliste als JSON, siehe Issue #7 |
| `DELETE /api/users/me` | Self-Service-Kontolöschung (DSGVO), hart, inkl. Merkliste |

Passwörter werden mit bcrypt gehasht (12 Rounds), Login/Registrierung/Passwort-Reset sind rate-limitiert (20 Requests/15 min pro IP). Ein echter E-Mail-Versand für den Passwort-Reset-Link ist noch nicht angebunden – der Link wird aktuell auf der Backend-Konsole geloggt.

## Sync-Crawler (Issue #3)

Ein Scheduler (`node-cron`) synchronisiert die Datenbank 4x täglich (00/06/12/18 Uhr) mit dem Fundtiere-Feed:

- Neue Einträge werden angelegt, bestehende aktualisiert, im Feed nicht mehr vorhandene aktive Einträge auf `status = 'removed'` gesetzt (kein Hard-Delete, wegen bestehender Merklisten-Referenzen). Taucht ein zuvor entferntes Tier wieder auf, wird es reaktiviert; ein manuell auf `adopted` gesetztes Tier wird vom Sync nie automatisch verändert.
- Admin-Anpassungen (`overrides`/`manually_edited`/`is_hidden`, Issue #5) werden von den Sync-Schreibzugriffen nie berührt.
- Thumbnails werden heruntergeladen, per `sharp`/Lanczos3 um Faktor 2 hochskaliert (die Quelle liefert selbst keine höher aufgelöste Variante, siehe `docs/data-source.md`) und lokal unter `backend/storage/images/` gecacht (kein Hotlinking der Quelle) und unter `GET /api/images/<external_id>.jpg` ausgeliefert; `image_url` behält zusätzlich die ursprüngliche Quell-URL als Fallback. Verwaiste Bilddateien werden nach jedem Lauf aufgeräumt.
- Jeder Lauf wird in `sync_runs` protokolliert (Zeitpunkt, neu/aktualisiert/entfernt, Fehler). Bei nicht erreichbarer Quelle bleibt die App mit dem zuletzt bekannten Datenstand funktionsfähig.
- Manueller Trigger: `POST /api/admin/sync` (nur für Admins), liefert eine Zusammenfassung des Laufs zurück.

## Animals- & Likes-API (Grundlage für Issue #4)

Nicht Teil eines eigenen Backend-Issues, aber notwendige Grundlage für das Frontend aus Issue #4. Alle Endpunkte erfordern Login.

| Endpunkt | Beschreibung |
|---|---|
| `GET /api/animals?limit=` | Aktive, nicht ausgeblendete, noch nicht gelikte Tiere in zufälliger Reihenfolge (Swipe-Stapel). Ist im Profil eine Art-Präferenz gesetzt, werden nur Tiere dieser Art(en) geliefert; ohne Präferenz alle Arten |
| `GET /api/animals/:id` | Detailansicht eines Tiers (auch `adopted`/`removed`, inkl. `isLiked`) |
| `POST /api/animals/:id/likes` | Tier merken (idempotent) |
| `DELETE /api/animals/:id/likes` | Tier aus Merkliste entfernen |
| `GET /api/users/me/likes` | Merkliste des angemeldeten Users |

Admin-Overrides (`overrides`-JSONB, Issue #5) werden beim Ausliefern automatisch auf die Basisfelder gemerged.

## Frontend (Issue #4)

React (Vite) + TypeScript + Tailwind + `react-router-dom` + `framer-motion`. Öffentlicher Bereich (Landing Page für Gäste, Login, Registrierung inkl. Präferenzen-Fragebogen, Passwort vergessen/zurücksetzen) und geschützter Bereich (Swipe-Ansicht mit Wisch-/Button-Bedienung, Merkliste mit Statusanzeige für nicht mehr verfügbare Tiere, Tierdetailseite, Kontoverwaltung). Mobile-first gestaltet; Auth-Status läuft komplett über das httpOnly-Cookie (`credentials: 'include'`), es wird kein Token im Frontend gespeichert.

**Startseite je nach Login-Status (Issue #13):** `/` zeigt nicht eingeloggten Nutzer:innen die Landing Page mit Registrieren-/Login-CTAs; bereits eingeloggte Nutzer:innen sehen stattdessen eine eigene Startseite (Begrüßung, Merkliste-Kurzstatus, Schnellzugriff auf Entdecken/Merkliste/Konto/Admin). `/registrieren`, `/login` und `/passwort-vergessen` leiten eingeloggte Nutzer:innen automatisch auf `/entdecken` um (`/reset-password` bleibt bewusst erreichbar, da der Reset-Flow über den Token läuft, unabhängig vom Login-Status der aktuellen Session).

**Entfernen aus der Merkliste (Issue #14/#15):** Das ✕ auf einer Tierkarte in der Merkliste fragt vor dem endgültigen Entfernen nach ("Bist du sicher, dass du dieses Tier entfernen willst?", Bestätigen/Abbrechen als vollbreite, untereinander angeordnete Buttons direkt auf der Karte).

## Admin-Bereich (Issue #5)

Geschützt unter `/admin` (nur `role = admin`, sonst Hinweis "Kein Zugriff"), eigenes schlichtes Dashboard-Layout unabhängig vom öffentlichen Design. Alle Backend-Endpunkte erfordern `requireAuth` + `requireAdmin`.

| Endpunkt | Beschreibung |
|---|---|
| `GET /api/admin/users` | Liste mit `search`/`role`/`status`-Filtern + Pagination (`page`/`pageSize`) |
| `GET /api/admin/users/:id` | Detail inkl. Like-Anzahl |
| `PATCH /api/admin/users/:id/block` | `{ isBlocked }`, protokolliert im Audit-Log |
| `PATCH /api/admin/users/:id/role` | `{ role }`; blockt Degradierung des letzten verbleibenden Admins (400) |
| `POST /api/admin/users/:id/reset-password` | Löst Passwort-Reset aus (Admin sieht nie das Klartext-Passwort, Link wird geloggt) |
| `DELETE /api/admin/users/:id` | Harter Delete, Audit-Log-Eintrag vor dem Löschen |
| `GET /api/admin/animals` | Liste mit `status`/`category`/`search`/`syncedBefore`-Filtern + Pagination |
| `GET /api/admin/animals/:id` | Detail inkl. Rohdaten (`externalId`, `manuallyEdited`, `isHidden`, `lastSyncedAt`, `overrides`) |
| `PATCH /api/admin/animals/:id` | `{ overrides, isHidden }` – ersetzt das komplette Override-Objekt, setzt `manuallyEdited` automatisch |
| `GET /api/admin/sync-runs` | Letzte Sync-Läufe (`limit`, Default 20) |
| `POST /api/admin/sync` | Manueller Sync-Trigger (bereits aus Issue #3) |

Sicherheitsrelevante Aktionen (Sperren/Entsperren, Rolle ändern, Löschen, Passwort-Reset, Tier-Override) werden in `audit_log` protokolliert. Die Schutzregel gegen die Selbst-Degradierung des letzten Admins ist als reine Funktion (`blocksLastAdminDemotion`) unit-getestet.

## Rechtliches (Issue #7)

⚠️ **Keine Rechtsberatung.** Die folgenden Seiten schaffen die technische/strukturelle Grundlage, ersetzen aber keine anwaltliche Prüfung vor dem produktiven Betrieb – siehe der Hinweis-Kasten auf der jeweiligen Seite selbst.

- **[`/impressum`](frontend/src/routes/Impressum.tsx)**: Enthält bewusst nur Platzhalter (Betreiber:in, Adresse, Kontakt, UID) – vor dem Live-Betrieb mit echten Angaben befüllen.
- **[`/datenschutz`](frontend/src/routes/Datenschutz.tsx)**: Beschreibt die tatsächliche Datenverarbeitung (welche Daten, Zweck, Speicherdauer, Empfänger, Cookies) auf Basis des echten Datenmodells.
- **[`/nutzungsbedingungen`](frontend/src/routes/Nutzungsbedingungen.tsx)**: Stellt klar, dass herztiere selbst keine Tiere vermittelt, sondern nur offene Daten anzeigt; Kontaktaufnahme läuft über die zuständige Stelle.
- Alle drei Seiten sind im Footer verlinkt (öffentlicher und registrierter Bereich).
- **DSGVO-Betroffenenrechte:** Löschung über die Self-Service-Kontolöschung (Issue #2), Auskunft/Datenübertragbarkeit über den Datenexport-Button im Kontobereich (`GET /api/users/me/export`), weitere Rechte (Berichtigung, Widerspruch, Beschwerde) sind in der Datenschutzerklärung mit Kontaktweg beschrieben.
- **Cookie-Consent:** Bewusst kein Banner eingebaut – die App setzt ausschließlich ein technisch notwendiges httpOnly-Auth-Cookie, keine Analytics/Tracking-Cookies. Bei Änderung dieser Cookie-Nutzung (z. B. Analytics) muss diese Einschätzung neu geprüft werden.

## Projektstruktur

```
herztiere/
├── backend/          Node/Express/TS API
│   ├── src/db/migrations/   SQL-Migrationen (Reihenfolge = Dateiname)
│   └── storage/images/      Lokal gecachte Fundtier-Thumbnails (Issue #3, nicht im Git)
├── frontend/         React/Vite/TS/Tailwind SPA
│   └── src/
│       ├── routes/          Seiten (Landing, Auth, Swipe, Merkliste, Tierdetail, Konto)
│       │   └── admin/       Admin-Bereich (Nutzer-/Tierverwaltung, Sync-Übersicht)
│       ├── components/      Swipe-Deck, Karten, Layout, AdminLayout, geteilte UI
│       ├── context/         AuthContext (lädt/hält den angemeldeten User)
│       └── lib/             API-Client, Typen, Label-Helfer
├── docs/
│   └── data-source.md       Recherche zur Datenquelle
├── docker-compose.yml
└── .env.example
```

## Entwicklung

Der Fortschritt und offene Punkte werden in [`memory.md`](./memory.md) festgehalten. Änderungen werden in [`CHANGELOG.md`](./CHANGELOG.md) dokumentiert. Die GitHub-Issues im Repo bilden den Arbeitsplan – ursprünglich 7 Issues (#1–#7), seither laufend um weitere Bugfixes/Features ergänzt (jede Änderung bekommt ein eigenes Issue, siehe `CLAUDE.md`).
