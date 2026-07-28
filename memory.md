# memory.md

Dieses File ist das Gedächtnis für die Weiterarbeit an diesem Projekt. Vor dem Weiterprogrammieren hier lesen; nach jeder abgeschlossenen Änderung hier aktualisieren.

## Projektstatus

- Phase: Issue #1 (Setup, Recherche, Datenmodell) – Grundgerüst steht
- Tech-Stack: React (Vite) + TypeScript + Tailwind CSS v4 (Frontend), Node.js + Express + TypeScript (Backend), PostgreSQL, docker-compose
- Zweck der App: "Tinder für Fundtiere" – Swipe-App über den Datensatz "Fundtiere Wien" (data.gv.at, Stadt Wien, CC BY 4.0). Registrierung, Merkliste, Admin-Bereich für Nutzer- und Tierverwaltung. Arbeitsplan liegt als 7 GitHub-Issues im Repo `Seife007/Herztiere` vor (Issue #1–#7, siehe TaskList in dieser Session für Mapping).

## Zuletzt erledigt

- 2026-07-28: Projekt "herztiere" angelegt (lokales Git-Repo, README, CHANGELOG, memory.md).
- 2026-07-28: GitHub-Remote verbunden (privates Repo `Seife007/Herztiere`, Auth per SSH-Key `~/.ssh/id_ed25519_herztiere`), erster Push nach `main`.
- 2026-07-28: Automatisches Kontext-Handling eingerichtet: `CLAUDE.md` (Arbeitsanweisungen) + `.claude/settings.json` mit SessionStart-Hook (lädt `memory.md` automatisch in den Kontext) und Stop-Hook (blockt Antwortende, wenn uncommittete Änderungen vorliegen, aber `memory.md` nicht mit aktualisiert wurde).
- 2026-07-29: Issue #1 bearbeitet:
  - GitHub-Issues gelesen (PAT-Zugriff, Token lokal unter `~/.herztiere-github-token`, chmod 600, **nicht** im Repo).
  - Datenquelle recherchiert: data.gv.at-Katalogseite ist eine SPA ohne erreichbares klassisches CKAN-API; tatsächliche Ressource über data.europa.eu Hub-Search-API gefunden: RSS-Feed `https://www.wien.gv.at/fundundvergabetiere/internet/rssfeed.xml` (CC BY 4.0, 188 aktuelle Einträge zum Zeitpunkt der Recherche). Vollständig dokumentiert inkl. Feld-Mapping in `docs/data-source.md`.
  - Frontend gescaffoldet (`frontend/`, Vite React-TS-Template + Tailwind v4 über `@tailwindcss/vite`, Default-Demo-Inhalte entfernt), Build getestet (`npm run build`, `npm run lint` via oxlint) – beides grün.
  - Backend gescaffoldet (`backend/`, Express + TS, `helmet`/`cors`/`express-rate-limit` bereits als Dependency vorbereitet für Issue #2, `/api/health`-Endpunkt), TypeScript-Build getestet, Server-Start manuell smoke-getestet.
  - DB-Schema als SQL-Migration (`backend/src/db/migrations/001_init.sql`) für `users`, `animals`, `likes`, `audit_log`, `sync_runs` inkl. `overrides`/`manually_edited`/`is_hidden`-Feldern für Issue #3/#5. Eigener Migrationsrunner (`backend/src/db/migrate.ts`, Tracking-Tabelle `schema_migrations`).
  - **Migration live gegen eine temporäre, isolierte lokale PostgreSQL-13-Instanz getestet** (initdb/pg_ctl im scratchpad, kein Eingriff in System-Postgres) – erfolgreich und idempotent (zweiter Lauf: "Migrations up to date.").
  - `docker-compose.yml` (db/backend/frontend), `Dockerfile`s für beide Services, `.env.example`, `.gitignore` (fehlte bisher!) angelegt.
  - README.md vollständig überarbeitet (Projektbeschreibung, Tech-Stack, Setup mit/ohne Docker, Projektstruktur, Lizenzhinweis-Pflicht).

## Offen / nächste Schritte

- Issue #1 Restpunkte: Docker selbst ist auf diesem System **nicht installiert** – `docker-compose.yml` wurde nur syntaktisch/inhaltlich erstellt, nie tatsächlich mit `docker compose up` durchprobiert. Vor Issue #6 (Integration) unbedingt einmal auf einer Maschine mit Docker verifizieren.
- Als Nächstes: Issue #2 (Backend Auth: Registrierung/Login/Rollen) – siehe TaskList Task #2.
- Update-Frequenz der echten Datenquelle ist nicht offiziell dokumentiert (siehe `docs/data-source.md`) – 4x täglich ist eine Annahme aus der Issue-Beschreibung, im Betrieb beobachten.
- GitHub PAT liegt lokal unter `~/.herztiere-github-token` – falls das Token abläuft/rotiert wird, neuen Token dort ablegen (chmod 600), nicht ins Repo committen.

## Entscheidungen & Begründungen

- Kontext-Automatisierung über Hooks statt nur CLAUDE.md-Instruktionen, weil reine Textanweisungen nicht zuverlässig durchgesetzt werden (memory.md könnte vergessen werden). SessionStart-Hook injiziert `memory.md` automatisch, Stop-Hook erzwingt Aktualisierung bei uncommitteten Änderungen.
- SSH statt HTTPS für GitHub-Auth gewählt, da `gh` CLI auf diesem System nicht installiert ist und kein Credential-Helper für HTTPS eingerichtet war.
- GitHub-Issue-Zugriff über einen vom Nutzer bereitgestellten Personal Access Token per `curl`, da `gh` CLI nicht installiert ist. Token lokal außerhalb des Repos gespeichert (`~/.herztiere-github-token`, chmod 600).
- Issue #1 wurde vollständig (inkl. Recherche, Scaffold, Migration, Doku) abgearbeitet, bevor mit Issue #2 begonnen wird, statt mehrere Issues parallel oberflächlich anzufangen – alle Folge-Issues bauen explizit auf #1 auf, und schlechte Grundannahmen hier (z. B. falsches DB-Schema) wären teuer zu korrigieren.
- Tailwind v4 (statt v3) verwendet, da das aktuell von `create-vite` installierte Tooling und `npm`-Registry-Standardversion Tailwind v4 ist (`@tailwindcss/vite`-Plugin statt `tailwind.config.js` + PostCSS).
- Override-Mechanismus für Tiere als ein flexibles `overrides` JSONB-Feld + `manually_edited`-Flag statt einzelner Override-Spalten pro Feld, für einfachere Erweiterbarkeit in Issue #3/#5.
- `source_url` bei Tieren zeigt auf die RSS-Feed-URL selbst (keine stabile Detailseite pro Tier in der Quelle vorhanden); Zuordnung erfolgt über `external_id` (= RSS-GUID).

## Bekannte Probleme

- Docker-Setup (`docker-compose.yml`) ist ungetestet (kein Docker auf diesem System verfügbar).
- Bild-URLs vom Fundtiere-Feed sind nur als Thumbnail bestätigt erreichbar (kein Vollbild-Pfad gefunden) – relevant für die Bild-Handling-Entscheidung in Issue #3.

## Hinweise für's Fortsetzen

- Nach jeder Session: diese Datei aktualisieren (Status, erledigte Punkte, offene Punkte, neue Entscheidungen).
- Änderungen zusätzlich in CHANGELOG.md eintragen.
