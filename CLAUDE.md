# CLAUDE.md

Anweisungen für Claude Code in diesem Projekt.

## Projektüberblick

"herztiere" – Swipe-App über den offenen Datensatz "Fundtiere Wien" (data.gv.at, Stadt Wien, CC BY 4.0). Details zu Zweck, Tech-Stack und Setup: [README.md](./README.md). Details zur Datenquelle: [docs/data-source.md](./docs/data-source.md).

Der Arbeitsplan liegt als 7 GitHub-Issues im Repo `Seife007/Herztiere` vor (Issue #1–#7), sie bauen z. T. aufeinander auf (siehe Abhängigkeiten in den jeweiligen Issue-Bodies). Aktueller Stand: siehe `memory.md`, Abschnitt "Projektstatus".

## Kontext beim Start

Der Inhalt von `memory.md` wird bei jeder Session automatisch per Hook in den Kontext geladen (siehe `.claude/settings.json`, SessionStart-Hook). Zusätzlich vor dem Weiterarbeiten `memory.md` selbst lesen, falls Details fehlen.

## Arbeiten mit den GitHub-Issues

`gh` CLI ist auf diesem System **nicht installiert**. Zugriff auf die GitHub-API läuft über einen Personal Access Token:

- Token liegt lokal unter `~/.herztiere-github-token` (chmod 600, **nicht** im Repo, nicht in Commits/Logs ausgeben).
- Zugriff per `curl -H "Authorization: Bearer $(cat ~/.herztiere-github-token)" -H "Accept: application/vnd.github+json" https://api.github.com/repos/Seife007/Herztiere/...`
- Wenn ein Issue vollständig abgearbeitet ist: Checkboxen im Issue-Body per PATCH auf `- [x]` setzen, einen zusammenfassenden Kommentar posten (was wurde gemacht, was ist offen/out of scope), dann das Issue schließen (`PATCH .../issues/{n}` mit `{"state":"closed","state_reason":"completed"}`).
- Größere Issues (Auth, Crawler, Frontend, Admin) einzeln vollständig abarbeiten (inkl. Recherche/Tests/Doku) statt mehrere parallel oberflächlich anzufangen – spätere Issues bauen aufeinander auf, falsche Grundannahmen früh sind teuer zu korrigieren.

## Testen ohne Docker

Docker ist auf diesem Entwicklungssystem **nicht installiert**. `docker-compose.yml` ist daher nur inhaltlich erstellt, nie tatsächlich mit `docker compose up` durchprobiert (siehe "Bekannte Probleme" in memory.md) – vor Issue #6 auf einer Maschine mit Docker verifizieren.

Für echte End-to-End-Tests (Migrationen, API-Flows) lokal PostgreSQL 13 (System-Paket, bereits installiert) nutzen, **ohne** die System-Instanz zu berühren:

```bash
PGBIN=/usr/lib/postgresql/13/bin
DATADIR=<scratchpad>/pgdata
SOCK=<scratchpad>
$PGBIN/initdb -D "$DATADIR" -U testuser --auth=trust -E UTF8
$PGBIN/pg_ctl -D "$DATADIR" -l "$DATADIR/log.txt" -o "-p 5544 -k $SOCK" start
$PGBIN/createdb -h "$SOCK" -p 5544 -U testuser herztiere_test
# DATABASE_URL="postgres://testuser@localhost:5544/herztiere_test?host=$SOCK"
# ... npm run migrate / Server starten / curl-Tests ...
$PGBIN/pg_ctl -D "$DATADIR" stop
rm -rf "$DATADIR"
```

Nach jedem Test-Durchlauf aufräumen (Prozesse beenden, `$DATADIR` löschen, Scratch-Dateien entfernen). Dieses Vorgehen wurde für Issue #1 (Migration) und Issue #2 (kompletter Auth-Flow: Register/Login/Reset/Self-Delete/Rate-Limit) erfolgreich genutzt.

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

## README.md

Bei neuen Endpunkten, Env-Variablen, Setup-Schritten oder Architekturentscheidungen README.md mitziehen (Tech-Stack, Setup, Projektstruktur, API-Tabellen) – sie ist der Einstiegspunkt für Menschen, memory.md ist der Einstiegspunkt für Claude.

## Git

- Nur committen, wenn der Nutzer explizit danach fragt.
- Remote: `git@github.com:Seife007/Herztiere.git` (privates Repo, SSH-Auth über den Key `~/.ssh/id_ed25519_herztiere`).

## Sonstiges

- `permissions.defaultMode: bypassPermissions` ist global in `~/.claude/settings.json` gesetzt (Nutzerwunsch) – Aktionen laufen ohne Rückfrage, trotzdem mit der gebotenen Sorgfalt bei destruktiven/schwer umkehrbaren Aktionen vorgehen.
