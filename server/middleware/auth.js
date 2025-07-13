import { config } from '@/config.js'
import { db } from '@/data/schema.js'
import { createAuthError } from '@/errors.js'
import jwt from 'jsonwebtoken'

export const getCookie = (req, name) => {
  const cookie = req.headers.get('cookie')
  if (!cookie) return null

  const cookies = Object.fromEntries(
    cookie.split(';').map((c) => {
      const [k, ...v] = c.trim().split('=')
      return [k, decodeURIComponent(v.join('='))]
    })
  )
  return cookies[name] || null
}

export const verifyJWT = (token) => {
  try {
    return jwt.verify(token, config.jwt.secret)
  } catch {
    return null
  }
}

export const isJWTRevoked = (token) => {
  const row = db
    .query('SELECT revoked FROM jwt_tokens WHERE token = ?')
    .get(token)
  return row ? !!row.revoked : false
}

export const authMiddleware = (req) => {
  const token = getCookie(req, 'session')
  if (!token) {
    throw createAuthError('Token not provided')
  }

  const payload = verifyJWT(token)
  if (!payload || isJWTRevoked(token)) {
    throw createAuthError('Invalid or revoked token')
  }

  return payload
}

export const adminMiddleware = (req) => {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw createAuthError('Admin token required')
  }

  const token = authHeader.split(' ')[1]
  if (token !== config.admin.key) {
    throw createAuthError('Invalid admin token')
  }

  return true
}
