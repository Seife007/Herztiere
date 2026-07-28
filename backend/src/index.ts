import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import { pool } from './db/pool.js'
import { authRouter } from './routes/auth.js'
import { usersRouter } from './routes/users.js'

const app = express()
const port = process.env.PORT ? Number(process.env.PORT) : 3000

app.use(helmet())
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(',') ?? true,
    credentials: true,
  }),
)
app.use(express.json())
app.use(cookieParser())

app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1')
    res.json({ status: 'ok', db: 'ok' })
  } catch {
    res.status(503).json({ status: 'ok', db: 'unreachable' })
  }
})

app.use('/api/auth', authRouter)
app.use('/api/users', usersRouter)

app.listen(port, () => {
  console.log(`herztiere backend listening on port ${port}`)
})
