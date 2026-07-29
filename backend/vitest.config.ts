import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // `npm run build` legt kompilierte Tests unter dist/ ab; ohne diesen
    // Ausschluss würde vitest sie zusätzlich zu den src/-Tests ausführen
    // und jeden Test doppelt zählen, sobald lokal einmal gebaut wurde.
    exclude: ['**/node_modules/**', '**/dist/**'],
  },
})
