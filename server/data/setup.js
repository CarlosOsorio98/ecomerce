// Inicializa la base de datos y carga los assets desde assets.json
import { createHash, randomUUID } from 'crypto'
import { z } from 'zod'
import { db } from './schema.js'

// Esquema de validación para un asset
const assetSchema = z.object({
  id: z.string(),
  name: z.string(),
  url: z.string(),
  price: z.number(),
})

// Esquema de validación para registro de usuario
export const userRegisterSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
})

// Esquema de validación para login
export const userLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

// Función para crear hash de contraseña
export function hashPassword(password) {
  return createHash('sha256').update(password).digest('hex')
}

// Función para crear usuario
export function createUser({ name, email, password }) {
  const id = randomUUID()
  const hashed = hashPassword(password)
  const created_at = new Date().toISOString()
  db.run(
    `INSERT INTO users (id, name, email, password, created_at) VALUES (?, ?, ?, ?, ?)`,
    [id, name, email, hashed, created_at]
  )
  return { id, name, email, created_at }
}

// Función para buscar usuario por email
export function getUserByEmail(email) {
  return db.query(`SELECT * FROM users WHERE email = ?`).get(email)
}

// Función para validar login
export function validateUserLogin(email, password) {
  const user = getUserByEmail(email)
  if (!user) return null
  const hashed = hashPassword(password)
  if (user.password !== hashed) return null
  // No devolver el hash
  const { password: _, ...userData } = user
  return userData
}
