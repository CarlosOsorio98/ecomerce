// Esquema de base de datos SQLite persistente y sincronizada usando Bun
import { Database } from 'bun:sqlite'

export const db = new Database('./server/data/db.sqlite')
