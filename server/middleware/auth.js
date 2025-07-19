import { config } from '../config.js'
import { getJWTToken } from '../repositories/jwtRepository.js'
import { createAuthError } from '../errors.js'
import jwt from 'jsonwebtoken'

export const getCookie = (req, name) => {
  const cookie = req.headers.get('cookie')
  if (!cookie) return null

  const cookies = Object.fromEntries(
    cookie.split(';').map((c) => {
      const [k, ...v] = c.trim().split('=')
      // Handle malformed cookies that include "Set-Cookie:" prefix
      const key = k.replace(/^Set-Cookie:\s*/, '')
      return [key, decodeURIComponent(v.join('='))]
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

export const isJWTRevoked = async (token) => {
  const tokenData = await getJWTToken(token)
  if (!tokenData) return false
  
  // Check if token is expired
  const now = new Date()
  const expiresAt = new Date(tokenData.expiresAt)
  return now > expiresAt
}

export const authMiddleware = async (req) => {
  const token = getCookie(req, 'session')
  if (!token) {
    return new Response(JSON.stringify({ error: 'Token not provided' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const payload = verifyJWT(token)
  if (!payload || (await isJWTRevoked(token))) {
    return new Response(JSON.stringify({ error: 'Invalid or revoked token' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Attach the payload to the request
  req.user = payload
  return null
}

export const requireAuth = async (req) => {
  const token = getCookie(req, 'session')
  if (!token) {
    throw createAuthError('Authentication required')
  }

  const payload = verifyJWT(token)
  if (!payload || (await isJWTRevoked(token))) {
    throw createAuthError('Invalid or expired session')
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
