# Changelog

Alle nennenswerten Änderungen an diesem Projekt werden hier dokumentiert.

Format angelehnt an [Keep a Changelog](https://keepachangelog.com/de/1.0.0/).

## [Unreleased]

### Added
- Projekt-Grundgerüst angelegt (README, CHANGELOG, memory.md).
- GitHub-Remote verbunden (privates Repo, SSH-Auth).
- `CLAUDE.md` und `.claude/settings.json` mit Hooks: memory.md wird bei Sessionstart automatisch geladen, und ein Stop-Hook erzwingt eine Aktualisierung von memory.md bei uncommitteten Änderungen.
