import { db } from '@/data/schema.js'
import { createHash, randomUUID } from 'crypto'

export const hashPassword = (password) =>
  createHash('sha256').update(password).digest('hex')

export const createUser = ({ name, email, password }) => {
  const id = randomUUID()
  const hashedPassword = hashPassword(password)
  const createdAt = new Date().toISOString()

  db.run(
    'INSERT INTO users (id, name, email, password, created_at) VALUES (?, ?, ?, ?, ?)',
    [id, name, email, hashedPassword, createdAt]
  )

  return { id, name, email, createdAt }
}

export const getUserByEmail = (email) =>
  db.query('SELECT * FROM users WHERE email = ?').get(email)

export const getUserById = (id) =>
  db.query('SELECT id, name, email, created_at FROM users WHERE id = ?').get(id)

export const validateUserCredentials = (email, password) => {
  const user = getUserByEmail(email)
  if (!user) return null

  const hashedPassword = hashPassword(password)
  if (user.password !== hashedPassword) return null

  const { password: _, ...userData } = user
  return userData
}
