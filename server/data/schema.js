// Esquema de base de datos libSQL persistente y sincronizada
import { createClient } from '@libsql/client'

export const db = createClient({
  url: process.env.TURSO_DATABASE_URL || 'file:./data/db.sqlite',
  authToken: process.env.TURSO_AUTH_TOKEN,
})
