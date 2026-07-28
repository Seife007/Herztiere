# CLAUDE.md

Anweisungen für Claude Code in diesem Projekt.

## Kontext beim Start

Der Inhalt von `memory.md` wird bei jeder Session automatisch per Hook in den Kontext geladen (siehe `.claude/settings.json`, SessionStart-Hook). Zusätzlich vor dem Weiterarbeiten `memory.md` selbst lesen, falls Details fehlen.

## Pflege von memory.md

`memory.md` ist das Gedächtnis dieses Projekts. Nach jeder inhaltlich relevanten Änderung (Feature, Fix, Entscheidung, neue offene Punkte) muss `memory.md` aktualisiert werden:

- **Projektstatus** aktuell halten (Phase, Tech-Stack, Zweck)
- **Zuletzt erledigt** ergänzen (mit Datum)
- **Offen / nächste Schritte** aktuell halten
- **Entscheidungen & Begründungen** ergänzen, wenn eine nicht-triviale Entscheidung getroffen wurde
- **Bekannte Probleme** ergänzen/entfernen

Ein Stop-Hook prüft automatisch, ob es uncommittete Änderungen gibt, ohne dass `memory.md` mit aktualisiert wurde, und fordert in diesem Fall zur Aktualisierung auf, bevor die Antwort abgeschlossen wird.

## CHANGELOG.md

Größere/nutzerrelevante Änderungen zusätzlich unter `[Unreleased]` in `CHANGELOG.md` eintragen (Format: Keep a Changelog).

## Git

- Nur committen, wenn der Nutzer explizit danach fragt.
- Remote: `git@github.com:Seife007/Herztiere.git` (privates Repo, SSH-Auth über den Key `~/.ssh/id_ed25519_herztiere`).
