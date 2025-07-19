import { userLoginSchema, userRegisterSchema } from '../dto/auth.js'
import { createValidationError } from '../errors.js'
import { getCookie } from '../middleware/auth.js'
import { getCORSHeaders } from '../middleware/cors.js'
import { getUserById } from '../repositories/userRepository.js'
import {
  clearSessionCookie,
  loginUser,
  logoutUser,
  registerUser,
  setSessionCookie,
} from '../services/authService.js'

export const register = async (req) => {
  const body = await req.json()
  const parsed = userRegisterSchema.safeParse(body)

  if (!parsed.success) {
    const errorMsg = parsed.error.errors?.map((e) => e.message).join(', ')
    throw createValidationError(errorMsg, parsed.error.errors)
  }

  const user = await registerUser(body)

  return new Response(JSON.stringify(user), {
    status: 201,
    headers: { ...getCORSHeaders(), 'Content-Type': 'application/json' },
  })
}

export const login = async (req) => {
  const body = await req.json()
  const parsed = userLoginSchema.safeParse(body)

  if (!parsed.success) {
    const errorMsg = parsed.error.errors?.map((e) => e.message).join(', ')
    throw createValidationError(errorMsg, parsed.error.errors)
  }

  const { user, token } = await loginUser(body.email, body.password)
  const cookieValue = setSessionCookie(token)

  return new Response(JSON.stringify(user), {
    status: 200,
    headers: {
      ...getCORSHeaders(),
      'Content-Type': 'application/json',
      'Set-Cookie': cookieValue,
    },
  })
}

export const getSession = async (req) => {
  // Check if there's a session token
  const token = getCookie(req, 'session')
  
  if (!token) {
    return new Response(JSON.stringify({ error: 'No active session' }), {
      status: 401,
      headers: { ...getCORSHeaders(), 'Content-Type': 'application/json' },
    })
  }

  // Verify the token manually since we're not using auth middleware
  const { verifyJWT, isJWTRevoked } = await import('../middleware/auth.js')
  const payload = verifyJWT(token)
  
  if (!payload || (await isJWTRevoked(token))) {
    return new Response(JSON.stringify({ error: 'Invalid or expired session' }), {
      status: 401,
      headers: { ...getCORSHeaders(), 'Content-Type': 'application/json' },
    })
  }

  const user = await getUserById(payload.id)
  
  if (!user) {
    // If user doesn't exist, treat as invalid session and clear the cookie
    const { clearSessionCookie } = await import('../services/authService.js')
    return new Response(JSON.stringify({ error: 'Invalid or expired session' }), {
      status: 401,
      headers: { 
        ...getCORSHeaders(), 
        'Content-Type': 'application/json',
        'Set-Cookie': clearSessionCookie()
      },
    })
  }

  return new Response(JSON.stringify(user), {
    status: 200,
    headers: { ...getCORSHeaders(), 'Content-Type': 'application/json' },
  })
}

export const logout = async (req) => {
  const token = getCookie(req, 'session')
  await logoutUser(token)

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      ...getCORSHeaders(),
      'Content-Type': 'application/json',
      'Set-Cookie': clearSessionCookie(),
    },
  })
}

