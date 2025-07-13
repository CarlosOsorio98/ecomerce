import { db } from '@/data/schema.js'

export const saveJWTToken = (userId, token) =>
  db.run('INSERT INTO jwt_tokens (user_id, token) VALUES (?, ?)', [
    userId,
    token,
  ])

export const revokeJWTToken = (token) =>
  db.run('UPDATE jwt_tokens SET revoked = 1 WHERE token = ?', [token])

export const getJWTToken = (token) =>
  db.query('SELECT revoked FROM jwt_tokens WHERE token = ?').get(token)
