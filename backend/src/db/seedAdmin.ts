import 'dotenv/config'
import { pool } from './pool.js'
import { hashPassword } from '../services/password.js'

async function run() {
  const email = process.env.SEED_ADMIN_EMAIL
  const password = process.env.SEED_ADMIN_PASSWORD
  if (!email || !password) {
    throw new Error('SEED_ADMIN_EMAIL und SEED_ADMIN_PASSWORD müssen in .env gesetzt sein')
  }

  const { rows } = await pool.query('SELECT id, role FROM users WHERE email = $1', [email])
  if (rows.length > 0) {
    if (rows[0].role !== 'admin') {
      await pool.query("UPDATE users SET role = 'admin' WHERE id = $1", [rows[0].id])
      console.log(`Bestehender User ${email} wurde zu admin befördert.`)
    } else {
      console.log(`${email} ist bereits admin, nichts zu tun.`)
    }
    await pool.end()
    return
  }

  const passwordHash = await hashPassword(password)
  await pool.query(
    "INSERT INTO users (email, password_hash, role) VALUES ($1, $2, 'admin')",
    [email, passwordHash],
  )
  console.log(`Admin-Account ${email} wurde angelegt.`)
  await pool.end()
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
