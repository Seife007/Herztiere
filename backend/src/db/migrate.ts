import 'dotenv/config'
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { pool } from './pool.js'

const migrationsDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'migrations')

async function run() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `)

  const files = (await readdir(migrationsDir)).filter((f) => f.endsWith('.sql')).sort()
  const { rows } = await pool.query('SELECT filename FROM schema_migrations')
  const applied = new Set(rows.map((r) => r.filename))

  for (const file of files) {
    if (applied.has(file)) continue
    const sql = await readFile(path.join(migrationsDir, file), 'utf-8')
    console.log(`Applying migration: ${file}`)
    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      await client.query(sql)
      await client.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [file])
      await client.query('COMMIT')
    } catch (err) {
      await client.query('ROLLBACK')
      throw err
    } finally {
      client.release()
    }
  }

  console.log('Migrations up to date.')
  await pool.end()
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
