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

### Ersten Admin-Account anlegen

`SEED_ADMIN_EMAIL` und `SEED_ADMIN_PASSWORD` in `.env` setzen, dann im `backend/`-Ordner:

```
npm run seed:admin
```

Legt den Account als `admin` an bzw. befördert einen bestehenden User mit dieser E-Mail zu `admin`. Es gibt keinen Weg, sich über die normale Registrierung selbst zum Admin zu machen.

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
| `DELETE /api/users/me` | Self-Service-Kontolöschung (DSGVO), hart, inkl. Merkliste |

Passwörter werden mit bcrypt gehasht (12 Rounds), Login/Registrierung/Passwort-Reset sind rate-limitiert (20 Requests/15 min pro IP). Ein echter E-Mail-Versand für den Passwort-Reset-Link ist noch nicht angebunden – der Link wird aktuell auf der Backend-Konsole geloggt.

## Sync-Crawler (Issue #3)

Ein Scheduler (`node-cron`) synchronisiert die Datenbank 4x täglich (00/06/12/18 Uhr) mit dem Fundtiere-Feed:

- Neue Einträge werden angelegt, bestehende aktualisiert, im Feed nicht mehr vorhandene aktive Einträge auf `status = 'removed'` gesetzt (kein Hard-Delete, wegen bestehender Merklisten-Referenzen). Taucht ein zuvor entferntes Tier wieder auf, wird es reaktiviert; ein manuell auf `adopted` gesetztes Tier wird vom Sync nie automatisch verändert.
- Admin-Anpassungen (`overrides`/`manually_edited`/`is_hidden`, Issue #5) werden von den Sync-Schreibzugriffen nie berührt.
- Thumbnails werden heruntergeladen und lokal unter `backend/storage/images/` gecacht (kein Hotlinking der Quelle) und unter `GET /api/images/<external_id>.jpg` ausgeliefert; `image_url` behält zusätzlich die ursprüngliche Quell-URL als Fallback. Verwaiste Bilddateien werden nach jedem Lauf aufgeräumt.
- Jeder Lauf wird in `sync_runs` protokolliert (Zeitpunkt, neu/aktualisiert/entfernt, Fehler). Bei nicht erreichbarer Quelle bleibt die App mit dem zuletzt bekannten Datenstand funktionsfähig.
- Manueller Trigger: `POST /api/admin/sync` (nur für Admins), liefert eine Zusammenfassung des Laufs zurück.

## Animals- & Likes-API (Grundlage für Issue #4)

Nicht Teil eines eigenen Backend-Issues, aber notwendige Grundlage für das Frontend aus Issue #4. Alle Endpunkte erfordern Login.

| Endpunkt | Beschreibung |
|---|---|
| `GET /api/animals?limit=` | Aktive, nicht ausgeblendete, noch nicht gelikte Tiere in zufälliger Reihenfolge (Swipe-Stapel) |
| `GET /api/animals/:id` | Detailansicht eines Tiers (auch `adopted`/`removed`, inkl. `isLiked`) |
| `POST /api/animals/:id/likes` | Tier merken (idempotent) |
| `DELETE /api/animals/:id/likes` | Tier aus Merkliste entfernen |
| `GET /api/users/me/likes` | Merkliste des angemeldeten Users |

Admin-Overrides (`overrides`-JSONB, Issue #5) werden beim Ausliefern automatisch auf die Basisfelder gemerged.

## Frontend (Issue #4)

React (Vite) + TypeScript + Tailwind + `react-router-dom` + `framer-motion`. Öffentlicher Bereich (Landing, Login, Registrierung inkl. Präferenzen-Fragebogen, Passwort vergessen/zurücksetzen) und geschützter Bereich (Swipe-Ansicht mit Wisch-/Button-Bedienung, Merkliste mit Statusanzeige für nicht mehr verfügbare Tiere, Tierdetailseite, Kontoverwaltung). Mobile-first gestaltet; Auth-Status läuft komplett über das httpOnly-Cookie (`credentials: 'include'`), es wird kein Token im Frontend gespeichert.

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

Der Fortschritt und offene Punkte werden in [`memory.md`](./memory.md) festgehalten. Änderungen werden in [`CHANGELOG.md`](./CHANGELOG.md) dokumentiert. Die GitHub-Issues im Repo bilden den Arbeitsplan (Issue #1–#7).
