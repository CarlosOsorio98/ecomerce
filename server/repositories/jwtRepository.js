import { eq, lt } from 'drizzle-orm'
import { db, jwtTokens } from '../data/schema.drizzle.js'

export const saveJWTToken = async (userId, token, expiresAt) => {
  await db.insert(jwtTokens).values({
    userId,
    token,
    expiresAt
  })
}

export const getJWTToken = async (token) => {
  const result = await db
    .select()
    .from(jwtTokens)
    .where(eq(jwtTokens.token, token))
    .limit(1)
  
  return result[0] || null
}

export const removeJWTToken = async (token) => {
  await db
    .delete(jwtTokens)
    .where(eq(jwtTokens.token, token))
}

export const cleanupExpiredTokens = async () => {
  const now = new Date().toISOString()
  await db
    .delete(jwtTokens)
    .where(lt(jwtTokens.expiresAt, now))
}
