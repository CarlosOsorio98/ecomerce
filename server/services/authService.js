import { config } from '../config.js'
import { createAuthError, createConflictError } from '../errors.js'
import { removeJWTToken, saveJWTToken } from '../repositories/jwtRepository.js'
import {
  createUser,
  getUserByEmail,
  validateUserCredentials,
} from '../repositories/userRepository.js'
import jwt from 'jsonwebtoken'

export const signJWT = (payload) =>
  jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn })

export const setSessionCookie = (token) => {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  return `session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800${secure}`
}

export const clearSessionCookie = () =>
  'session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0'

export const registerUser = async (userData) => {
  const existingUser = await getUserByEmail(userData.email)
  if (existingUser) {
    throw createConflictError('Email already registered')
  }

  return await createUser(userData)
}

export const loginUser = async (email, password) => {
  const user = await validateUserCredentials(email, password)
  if (!user) {
    throw createAuthError('Invalid credentials')
  }

  const token = signJWT({ id: user.id, email: user.email })
  
  // Calculate expiration time (7 days from now)
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  await saveJWTToken(user.id, token, expiresAt)

  return { user, token }
}

export const logoutUser = async (token) => {
  if (token) {
    await removeJWTToken(token)
  }
}

