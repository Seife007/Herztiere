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
- Zusätzliche Unit-Test-Abdeckung: `resolveAnimal`-Override-Merge und alle Admin-zod-Schemas im Backend; erstmals vitest im Frontend eingerichtet mit Tests für die Label-/Formatierungs-Hilfsfunktionen (`lib/animalLabels.ts`) und `resolveImageUrl` (`lib/api.ts`).
- Issue #6 (Integration, E2E-Tests & README):
  - Public-Flow (Landing → Registrierung → Swipe → Merkliste → Tierdetail → Konto) und Admin-Flow (Zugriffsschutz → Nutzerverwaltung → Tierverwaltung → manueller Sync-Trigger) erneut live end-to-end verifiziert, insbesondere nach dem Routing-Umbau (`PublicLayout`/`AdminLayout`) aus Issue #5 – keine Regression.
  - README um Abschnitt "Umgebungsvariablen" mit Tabelle aller `.env.example`-Variablen ergänzt.
- Issue #7 (Rechtliches: Impressum, Datenschutzerklärung & DSGVO-Konformität):
  - Neue Seiten `/impressum` (Platzhalter-Angaben, klar als solche markiert), `/datenschutz` (Datenverarbeitung/Zweck/Speicherdauer/Empfänger/Cookies/Betroffenenrechte auf Basis des echten Datenmodells) und `/nutzungsbedingungen` (Disclaimer: keine eigene Tiervermittlung), verlinkt im Footer (öffentlicher und registrierter Bereich).
  - DSGVO-Datenexport: `GET /api/users/me/export` liefert Konto- und Merklisten-Daten als JSON, im Kontobereich per Button als Datei herunterladbar (Auskunftsrecht + Datenübertragbarkeit, Art. 15/20 DSGVO).
  - Bewusste Entscheidung gegen einen Cookie-Consent-Banner dokumentiert (nur ein technisch notwendiges Auth-Cookie, keine Analytics/Tracking).
  - Live-E2E-Test: Footer-Links (eingeloggt/nicht eingeloggt), alle drei neuen Seiten erreichbar, Datenexport-Download mit korrektem Inhalt.
- Issue #14: Das ✕ zum Entfernen eines Tiers aus der Merkliste (`AnimalListCard.tsx`) fragt jetzt vor dem endgültigen Entfernen nach ("Bist du sicher, dass du dieses Tier entfernen willst?", Bestätigen/Abbrechen als Overlay auf der Karte). ✕ ist auf schmalen Viewports (Touch, kein Hover) jetzt dauerhaft sichtbar statt nur bei `:hover`.

### Changed
- `CLAUDE.md` um projektspezifische Arbeitsanweisungen erweitert: Issue-Workflow über die GitHub-API (PAT statt `gh` CLI), Vorgehen zum Testen ohne lokal installiertes Docker (temporäre isolierte Postgres-Instanz), Pflicht zu Unit-Tests für wichtige/nicht-triviale Logik (Backend und Frontend).
- Issue #9: Tierbilder werden beim Caching jetzt per `sharp`/Lanczos3 um Faktor 2 hochskaliert (`imageCache.ts`), da die Datenquelle nachweislich keine höher aufgelöste Variante liefert (siehe `docs/data-source.md`) – erzeugt keine echten Zusatzdetails, reduziert aber sichtbare Pixelbildung auf großen Bildschirmen.

### Fixed
- Backend-`npm test` zählte nach einem lokalen `npm run build` jeden Test doppelt, weil vitest ohne Exclude-Config auch die nach `dist/` kompilierten Test-Dateien ausführte (`backend/vitest.config.ts` ergänzt).
- Issue #10: Tierkarte in der Swipe-Ansicht (`AnimalCard.tsx`) hatte durch `shadow-xl` einen asymmetrischen Schatten (nur unten sichtbar) – Schatten entfernt.
- Issue #8: `GET /api/animals` (Swipe-Stapel) berücksichtigte die im Profil hinterlegte Art-Präferenz (`speciesInterest`) nicht und zeigte immer Tiere aller Arten – `findAnimalsForSwiping()` filtert jetzt nach `category` (bzw. deren Admin-Override), sofern mindestens eine Art ausgewählt ist; ohne Präferenz weiterhin alle Arten.
- Issue #12: Frontend funktionierte nur zuverlässig über die eine IP/den Host, für den `VITE_API_URL` fest hinterlegt war – `api.ts` nutzt jetzt standardmäßig relative `/api/...`-Pfade, die vom bereits vorhandenen, aber ungenutzten Vite-Proxy ans Backend weitergereicht werden. Funktioniert dadurch unabhängig von der aufrufenden IP/dem Host (getestet über `localhost`, LAN-IP und Tailscale-IP ohne Änderung an Env-Variablen), löst nebenbei die SameSite-Cookie-Problematik bei Cross-Host-Zugriff und macht es möglich, ausschließlich den Frontend-Port nach außen freizugeben.
- Issue #11: Frontend-Dev-Server kann jetzt optional per HTTPS laufen – `vite.config.ts` aktiviert automatisch HTTPS, sobald ein per `mkcert` erzeugtes Zertifikat unter `frontend/certs/` liegt (siehe README). Backend/Proxy-Hop bleiben bewusst HTTP (kein Mixed-Content-Problem dank Issue #12).
- Issue #13: Eingeloggte Nutzer sahen auf `/` weiterhin die Werbe-Landing-Page samt Registrieren-/Login-Buttons und konnten `/registrieren`, `/login`, `/passwort-vergessen` direkt aufrufen. Neue Route `Home.tsx` zeigt eingeloggten Nutzern jetzt eine `LoggedInHome`-Ansicht (Begrüßung, Merkliste-Kurzstatus, Schnellzugriff auf Entdecken/Merkliste/Konto/Admin) statt der Landing Page; neue `GuestRoute`-Komponente leitet eingeloggte Nutzer von `/registrieren`, `/login`, `/passwort-vergessen` automatisch auf `/entdecken` um (`/reset-password` bewusst ausgenommen, da der Reset-Token-Flow unabhängig vom aktuellen Login-Status funktionieren muss).
