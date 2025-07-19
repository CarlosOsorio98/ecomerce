import { eq } from 'drizzle-orm'
import { db, users } from '../data/schema.drizzle.js'
import { createHash } from 'crypto'

export const hashPassword = (password) =>
  createHash('sha256').update(password).digest('hex')

export const createUser = async ({ name, email, password }) => {
  const hashedPassword = hashPassword(password)

  const result = await db.insert(users).values({
    name,
    email,
    password: hashedPassword
  }).returning({
    id: users.id,
    name: users.name,
    email: users.email,
    created_at: users.createdAt
  })

  return result[0]
}

export const getUserByEmail = async (email) => {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1)
  
  return result[0] || null
}

export const getUserById = async (id) => {
  const result = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      created_at: users.createdAt
    })
    .from(users)
    .where(eq(users.id, id))
    .limit(1)
  
  return result[0] || null
}

export const validateUserCredentials = async (email, password) => {
  const user = await getUserByEmail(email)
  if (!user) return null

  const hashedPassword = hashPassword(password)
  if (user.password !== hashedPassword) return null

  const { password: _, ...userData } = user
  return userData
}
