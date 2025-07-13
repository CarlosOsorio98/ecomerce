import { config } from '@/config.js'
import { createAuthError, createConflictError } from '@/errors.js'
import { revokeJWTToken, saveJWTToken } from '@/repositories/jwtRepository.js'
import {
  createUser,
  getUserByEmail,
  validateUserCredentials,
} from '@/repositories/userRepository.js'
import jwt from 'jsonwebtoken'

export const signJWT = (payload) =>
  jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn })

export const setSessionCookie = (token) => {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  return `session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800${secure}`
}

export const clearSessionCookie = () =>
  'session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0'

export const registerUser = (userData) => {
  const existingUser = getUserByEmail(userData.email)
  if (existingUser) {
    throw createConflictError('Email already registered')
  }

  return createUser(userData)
}

export const loginUser = (email, password) => {
  const user = validateUserCredentials(email, password)
  if (!user) {
    throw createAuthError('Invalid credentials')
  }

  const token = signJWT({ id: user.id, email: user.email })
  saveJWTToken(user.id, token)

  return { user, token }
}

export const logoutUser = (token) => {
  if (token) {
    revokeJWTToken(token)
  }
}
