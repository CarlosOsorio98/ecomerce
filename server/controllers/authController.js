import { userLoginSchema, userRegisterSchema } from '@/dto/auth.js'
import { createNotFoundError, createValidationError } from '@/errors.js'
import { authMiddleware, getCookie } from '@/middleware/auth.js'
import { getCORSHeaders } from '@/middleware/cors.js'
import { getUserById } from '@/repositories/userRepository.js'
import {
  clearSessionCookie,
  loginUser,
  logoutUser,
  registerUser,
  setSessionCookie,
} from '@/services/authService.js'

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
  const payload = await authMiddleware(req)
  const user = await getUserById(payload.id)

  if (!user) {
    throw createNotFoundError('User not found')
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
