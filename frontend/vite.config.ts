import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Lokales Dev-HTTPS (Issue #11): per `mkcert` erzeugtes, lokal
// vertrauenswürdiges Zertifikat unter frontend/certs/ (siehe README für die
// Erzeugung) - falls nicht vorhanden, läuft der Dev-Server wie bisher per
// HTTP. Nur das Frontend braucht HTTPS; der /api-Proxy zum Backend läuft
// weiterhin serverseitig per HTTP (kein Mixed-Content-Problem, da dieser Hop
// nie im Browser stattfindet, siehe Issue #12).
const certPath = path.resolve(__dirname, 'certs/dev-cert.pem')
const keyPath = path.resolve(__dirname, 'certs/dev-key.pem')
const hasDevCert = fs.existsSync(certPath) && fs.existsSync(keyPath)

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    port: 5173,
    https: hasDevCert ? { cert: fs.readFileSync(certPath), key: fs.readFileSync(keyPath) } : undefined,
    proxy: {
      // Ziel des Dev-Server-seitigen Proxys - läuft rein serverseitig
      // (Node-Prozess), daher bewusst nicht als VITE_-Variable exponiert.
      // Lokal (außerhalb Docker) ist der Backend-Port über "localhost"
      // erreichbar; innerhalb von docker-compose läuft das Frontend in
      // einem eigenen Container, dort muss stattdessen der Servicename
      // "backend" adressiert werden (siehe docker-compose.yml, Issue #12).
      '/api': {
        target: process.env.BACKEND_URL ?? 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
