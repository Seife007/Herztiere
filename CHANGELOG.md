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
