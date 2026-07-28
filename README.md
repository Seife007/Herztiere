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

## Projektstruktur

```
herztiere/
├── backend/          Node/Express/TS API
│   └── src/db/migrations/   SQL-Migrationen (Reihenfolge = Dateiname)
├── frontend/         React/Vite/TS/Tailwind SPA
├── docs/
│   └── data-source.md       Recherche zur Datenquelle
├── docker-compose.yml
└── .env.example
```

## Entwicklung

Der Fortschritt und offene Punkte werden in [`memory.md`](./memory.md) festgehalten. Änderungen werden in [`CHANGELOG.md`](./CHANGELOG.md) dokumentiert. Die GitHub-Issues im Repo bilden den Arbeitsplan (Issue #1–#7).
