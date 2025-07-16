import { db } from '@/data/schema.js'
import { createHash, randomUUID } from 'crypto'

export const hashPassword = (password) =>
  createHash('sha256').update(password).digest('hex')

export const createUser = async ({ name, email, password }) => {
  const id = randomUUID()
  const hashedPassword = hashPassword(password)
  const createdAt = new Date().toISOString()

  await db.execute({
    sql: 'INSERT INTO users (id, name, email, password, created_at) VALUES (?, ?, ?, ?, ?)',
    args: [id, name, email, hashedPassword, createdAt]
  })

  return { id, name, email, createdAt }
}

export const getUserByEmail = async (email) => {
  const result = await db.execute({
    sql: 'SELECT * FROM users WHERE email = ?',
    args: [email]
  })
  return result.rows[0]
}

export const getUserById = async (id) => {
  const result = await db.execute({
    sql: 'SELECT id, name, email, created_at FROM users WHERE id = ?',
    args: [id]
  })
  return result.rows[0]
}

export const validateUserCredentials = async (email, password) => {
  const user = await getUserByEmail(email)
  if (!user) return null

  const hashedPassword = hashPassword(password)
  if (user.password !== hashedPassword) return null

  const { password: _, ...userData } = user
  return userData
}
