# Changelog

Alle nennenswerten Änderungen an diesem Projekt werden hier dokumentiert.

Format angelehnt an [Keep a Changelog](https://keepachangelog.com/de/1.0.0/).

## [Unreleased]

### Added
- Projekt-Grundgerüst angelegt (README, CHANGELOG, memory.md).
- GitHub-Remote verbunden (privates Repo, SSH-Auth).
- `CLAUDE.md` und `.claude/settings.json` mit Hooks: memory.md wird bei Sessionstart automatisch geladen, und ein Stop-Hook erzwingt eine Aktualisierung von memory.md bei uncommitteten Änderungen.
- Issue #1 (Setup, Recherche, Datenmodell):
  - Recherche zur Datenquelle "Fundtiere Wien" dokumentiert (`docs/data-source.md`), inkl. echter RSS-Feed-URL und Feld-Mapping.
  - Frontend-Grundgerüst: React (Vite) + TypeScript + Tailwind CSS v4 (`frontend/`).
  - Backend-Grundgerüst: Node.js + Express + TypeScript, `/api/health`-Endpunkt (`backend/`).
  - DB-Schema als Migration (`users`, `animals`, `likes`, `audit_log`, `sync_runs`) mit eigenem Migrationsrunner, live getestet.
  - `docker-compose.yml`, Dockerfiles für Backend/Frontend, `.env.example`, `.gitignore`.
  - README um Tech-Stack, Setup-Anleitung, Projektstruktur und Lizenzhinweis-Pflicht (CC BY 4.0) erweitert.
- Issue #2 (Backend: Registrierung, Login & Rollen):
  - Registrierung/Login mit bcrypt-Passwort-Hashing und JWT in httpOnly-Cookie.
  - Rollenmodell `user`/`admin`, `requireAuth`/`requireAdmin`-Middleware, User wird pro Request live aus der DB geladen (Sperren wirkt sofort).
  - "Passwort vergessen"-Flow mit zeitlich befristetem, gehashtem, einmal verwendbarem Reset-Token.
  - Rate-Limiting auf allen Auth-Endpunkten.
  - Self-Service-Kontolöschung (`DELETE /api/users/me`, DSGVO-Löschungsrecht) inkl. Merkliste.
  - Admin-Seed-Script (`npm run seed:admin`).
  - Unit-Tests für Hashing/JWT/Validierung.
- Issue #3 (Backend: Automatischer Sync-Crawler, 4x täglich):
  - RSS-Feed-Parser (`fast-xml-parser`) mit Feld-Mapping gemäß `docs/data-source.md`.
  - Merge-Logik: neu anlegen / aktualisieren / als "removed" markieren / reaktivieren, ohne Admin-Anpassungen (`overrides`/`manually_edited`/`is_hidden`) zu überschreiben.
  - Bild-Caching (eigener Download + lokale Speicherung statt Hotlinking, Migration `003_sync.sql`), ausgeliefert unter `GET /api/images/<external_id>.jpg`, inkl. Aufräumen verwaister Dateien.
  - Scheduler (`node-cron`, 00/06/12/18 Uhr) und manueller Trigger `POST /api/admin/sync` (nur Admins).
  - Protokollierung jedes Laufs in `sync_runs`, robuste Fehlerbehandlung bei nicht erreichbarer Quelle.
  - Unit-Tests für Merge-Logik/Feed-Parsing sowie Live-E2E-Test gegen den echten Feed.
- Animals- & Likes-API (Grundlage für Issue #4, in keinem eigenen Issue vorgesehen): `GET /api/animals`, `GET /api/animals/:id`, `POST`/`DELETE /api/animals/:id/likes`, `GET /api/users/me/likes`. Wendet Admin-Overrides beim Ausliefern automatisch an.
- Issue #4 (Frontend: Landing Page, Auth-Flow, Swipe-Ansicht & Merkliste):
  - Grundgerüst: `react-router-dom`, `framer-motion`, API-Client mit Cookie-Auth, `AuthContext`, warme Farbpalette/Design-Tokens (Tailwind v4 `@theme`).
  - Landing Page mit Konzept-Erklärung, illustrativen Beispielkarten und CTA zur Registrierung.
  - Auth-Flow: Registrierung (inkl. Präferenzen-Fragebogen: Tierart-Interesse, Erfahrungslevel, Wohnsituation), Login, Passwort vergessen/zurücksetzen.
  - Swipe-Ansicht: Kartenstapel mit Wisch-Gesten und Buttons, Kartenrotation, Herz-Animation bei Like, leerer/Lade-/Fehlerzustand.
  - Merkliste mit Statusanzeige für nicht mehr verfügbare/vermittelte Tiere, Tierdetailseite mit allen Feldern, CC-BY-4.0-Hinweis und Kontakt zur zuständigen Stelle.
  - Kontoverwaltung: Präferenzen ändern, Selbstlöschung mit Bestätigungsdialog.
  - Live gegen laufendes Backend getestet (Playwright + Chromium, mobile und Desktop-Viewport): kompletter Flow Landing → Registrierung → Swipe → Merkliste → Tierdetail → Konto → Löschung, plus Login-Fehlerfall und Passwort-Reset-Flow.
  - Dabei gefunden und behoben: Helmets Standard-`Cross-Origin-Resource-Policy` blockierte das Laden der Tierbilder vom Backend (andere Origin); Nav verursachte horizontalen Overflow auf schmalen Bildschirmen; Fund-Datum wurde als roher ISO-Timestamp statt als Datum angezeigt; Exit-Animation der Swipe-Karte hatte bei Klick auf die Buttons (statt Wisch-Geste) immer dieselbe Richtung.
- Issue #5 (Admin-Frontend: Benutzer- & Tierverwaltung):
  - Backend: Admin-Endpunkte für Nutzerverwaltung (Liste mit Suche/Filter/Pagination, Sperren/Entsperren, Rolle ändern, Passwort-Reset auslösen, Löschen) und Tierverwaltung (Liste mit Filter, Overrides/`manually_edited` setzen, manuelles Ausblenden unabhängig vom Sync-Status) sowie Sync-Läufe auflisten.
  - Schutzregel gegen Selbst-Degradierung des letzten verbleibenden Admins (`blocksLastAdminDemotion`, reine Funktion, unit-getestet).
  - Audit-Log-Einträge für alle sicherheitsrelevanten Aktionen (Sperren/Entsperren, Rolle ändern, Löschen, Passwort-Reset-Trigger, Tier-Override).
  - Frontend: Eigener geschützter Bereich `/admin` (nur `role = admin`) mit schlichtem, vom öffentlichen Design unabhängigem Dashboard-Layout, Nutzer- und Tierverwaltung, Sync-Übersicht mit manuellem Trigger.
  - Live-E2E-Test (Playwright + System-Chromium) gegen temporäre Postgres-Instanz + laufendes Frontend/Backend: Zugriffsschutz, Nutzerliste/-suche, Sperren/Entsperren, Passwort-Reset-Trigger, Schutz des letzten Admins (blockiert bei 1 Admin, erlaubt bei 2), Löschen mit Bestätigungsdialog, Tierliste/-filter, Override-Bearbeitung inkl. Persistenz nach Reload, manuelles Ausblenden, Sync-Übersicht + manueller Trigger.

### Changed
- `CLAUDE.md` um projektspezifische Arbeitsanweisungen erweitert: Issue-Workflow über die GitHub-API (PAT statt `gh` CLI), Vorgehen zum Testen ohne lokal installiertes Docker (temporäre isolierte Postgres-Instanz).
