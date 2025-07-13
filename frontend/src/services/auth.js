import { logout, setUser } from '../state.js'
import { userApi } from './user.js'

const clearLocalData = () => {
  localStorage.removeItem('user_session')
  localStorage.removeItem('debug_session')
  localStorage.removeItem('debug_login')
}

const checkSession = async (retries = 2) => {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch('/api/session', {
        credentials: 'include',
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!res.ok) {
        if (res.status === 401) {
          clearLocalData()
          return null
        }
        throw new Error(`HTTP ${res.status}: ${res.statusText}`)
      }

      const user = await res.json()
      localStorage.setItem('user_session', JSON.stringify(user))
      localStorage.setItem(
        'debug_session',
        JSON.stringify({
          status: res.status,
          ok: res.ok,
          user,
          timestamp: new Date().toISOString(),
          attempt: attempt + 1,
        })
      )

      setUser(user)
      return user
    } catch (error) {
      console.error(`Error en intento ${attempt + 1}:`, error)

      if (attempt === retries) {
        clearLocalData()
        localStorage.setItem(
          'debug_session',
          JSON.stringify({
            error: error.message,
            timestamp: new Date().toISOString(),
            totalAttempts: retries + 1,
          })
        )
        return null
      }

      await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)))
    }
  }

  return null
}

const signIn = async (email, password) => {
  if (!email || !password) {
    throw new Error('Email y contraseña son requeridos')
  }

  const user = await userApi.login({ email, password })

  if (!user) {
    throw new Error('Credenciales inválidas')
  }

  localStorage.setItem('debug_login', JSON.stringify(user))
  localStorage.setItem('user_session', JSON.stringify(user))

  const { password: _, ...userWithoutPassword } = user

  setUser(userWithoutPassword)

  return userWithoutPassword
}

const signUp = async (userData) => {
  const { email, password, name } = userData

  if (!email || !password || !name) {
    throw new Error('Todos los campos son requeridos')
  }

  const user = await userApi.register({ name, email, password })

  return user
}

const signOut = async () => {
  try {
    const res = await fetch('/api/logout', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!res.ok) {
      console.warn('Error al cerrar sesión en el servidor')
    }
  } catch (error) {
    console.error('Error al cerrar sesión:', error)
  } finally {
    clearLocalData()
    logout()
  }
}

export const authService = {
  checkSession,
  signIn,
  signUp,
  signOut,
  clearLocalData,
}
