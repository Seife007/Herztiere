# memory.md

Dieses File ist das Gedächtnis für die Weiterarbeit an diesem Projekt. Vor dem Weiterprogrammieren hier lesen; nach jeder abgeschlossenen Änderung hier aktualisieren.

## Projektstatus

- Phase: Setup / Grundgerüst
- Tech-Stack: noch nicht festgelegt
- Zweck der App: noch nicht beschrieben

## Zuletzt erledigt

- 2026-07-28: Projekt "herztiere" angelegt (lokales Git-Repo, README, CHANGELOG, memory.md).
- 2026-07-28: GitHub-Remote verbunden (privates Repo `Seife007/Herztiere`, Auth per SSH-Key `~/.ssh/id_ed25519_herztiere`), erster Push nach `main`.
- 2026-07-28: Automatisches Kontext-Handling eingerichtet: `CLAUDE.md` (Arbeitsanweisungen) + `.claude/settings.json` mit SessionStart-Hook (lädt `memory.md` automatisch in den Kontext) und Stop-Hook (blockt Antwortende, wenn uncommittete Änderungen vorliegen, aber `memory.md` nicht mit aktualisiert wurde).

## Offen / nächste Schritte

- Zweck und Feature-Umfang der App klären
- Tech-Stack festlegen

## Entscheidungen & Begründungen

- Kontext-Automatisierung über Hooks statt nur CLAUDE.md-Instruktionen, weil reine Textanweisungen nicht zuverlässig durchgesetzt werden (memory.md könnte vergessen werden). SessionStart-Hook injiziert `memory.md` automatisch, Stop-Hook erzwingt Aktualisierung bei uncommitteten Änderungen.
- SSH statt HTTPS für GitHub-Auth gewählt, da `gh` CLI auf diesem System nicht installiert ist und kein Credential-Helper für HTTPS eingerichtet war.

## Bekannte Probleme

_Noch keine._

## Hinweise für's Fortsetzen

- Nach jeder Session: diese Datei aktualisieren (Status, erledigte Punkte, offene Punkte, neue Entscheidungen).
- Änderungen zusätzlich in CHANGELOG.md eintragen.
