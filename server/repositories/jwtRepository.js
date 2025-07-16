import { db } from '@/data/schema.js'

export const saveJWTToken = async (userId, token) =>
  await db.execute({
    sql: 'INSERT INTO jwt_tokens (user_id, token) VALUES (?, ?)',
    args: [userId, token]
  })

export const revokeJWTToken = async (token) =>
  await db.execute({
    sql: 'UPDATE jwt_tokens SET revoked = 1 WHERE token = ?',
    args: [token]
  })

export const getJWTToken = async (token) => {
  const result = await db.execute({
    sql: 'SELECT revoked FROM jwt_tokens WHERE token = ?',
    args: [token]
  })
  return result.rows[0]
}
