-- Sync-Crawler (Issue #3)
-- Spalte für den Pfad des lokal gecachten Bildes (statt Hotlinking der Quelle,
-- siehe Entscheidung in memory.md). image_url bleibt als ursprüngliche
-- Quell-URL erhalten und dient als Fallback, falls der Download fehlschlägt.

ALTER TABLE animals ADD COLUMN cached_image_path TEXT;
