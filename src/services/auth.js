import { logout, setUser, isAuthenticated } from '~/lib/state.js'
import { userApi } from './user.js'

const clearLocalData = async (forceReload = false) => {
  // Clear all localStorage items
  localStorage.removeItem('user_session')
  localStorage.removeItem('debug_session')
  localStorage.removeItem('debug_login')
  localStorage.removeItem('auth_user')
  
  // Clear sessionStorage as well
  sessionStorage.removeItem('user_session')
  sessionStorage.removeItem('debug_session')
  sessionStorage.removeItem('debug_login')
  sessionStorage.removeItem('auth_user')
  
  // Multiple methods to clear the session cookie
  const cookieClearMethods = [
    // Method 1: Cookie Store API (modern browsers)
    async () => {
      if ('cookieStore' in window) {
        try {
          await cookieStore.delete('session')
          await cookieStore.delete({name: 'session', path: '/'})
          await cookieStore.delete({name: 'session', path: '/', domain: window.location.hostname})
          console.log('Cleared cookie via Cookie Store API')
          return true
        } catch (error) {
          console.warn('Cookie Store API failed:', error)
          return false
        }
      }
      return false
    },
    
    // Method 2: Multiple document.cookie attempts with different configurations
    () => {
      const configs = [
        'session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;',
        'session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=' + window.location.hostname + ';',
        'session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.' + window.location.hostname + ';',
        'session=; max-age=0; path=/;',
        'session=; max-age=0; path=/; domain=' + window.location.hostname + ';',
        'session=; max-age=0; path=/; domain=.' + window.location.hostname + ';',
        'session=deleted; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;',
        'session=deleted; max-age=0; path=/;'
      ]
      
      configs.forEach(config => {
        document.cookie = config
      })
      
      console.log('Cleared cookie via document.cookie')
      return true
    }
  ]
  
  // Try all methods
  for (const method of cookieClearMethods) {
    try {
      const success = await method()
      if (success) break
    } catch (error) {
      console.warn('Cookie clear method failed:', error)
    }
  }
  
  // Only force reload if explicitly requested (for invalid sessions)
  if (forceReload && window.location.pathname !== '/login' && window.location.pathname !== '/register') {
    console.log('Forcing page reload to clear invalid session state')
    setTimeout(() => window.location.reload(), 100)
  }
}

const checkSession = async (retries = 2) => {
  console.log('🔍 Checking session with server...')

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch('/api/auth/session', {
        credentials: 'include',
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          // Token inválido, expirado o revocado
          console.log('Token de sesión inválido, limpiando datos...')
          await clearLocalData(true) // Force reload for invalid sessions
          logout()
          return null
        }
        throw new Error(`HTTP ${res.status}: ${res.statusText}`)
      }

      const user = await res.json()
      console.log('✅ Session valid, user authenticated:', user.email)
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
        await clearLocalData(false) // Don't force reload on network errors
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
    const res = await fetch('/api/auth/logout', {
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
    await clearLocalData(false) // Normal logout, don't force reload
    logout()
  }
}

// Utility function to force clear all possible session data
const forceSessionClear = async () => {
  console.log('Force clearing all session data...')
  
  // Clear all localStorage
  try {
    localStorage.clear()
  } catch (e) {
    console.warn('Failed to clear localStorage:', e)
  }
  
  // Clear all sessionStorage
  try {
    sessionStorage.clear()
  } catch (e) {
    console.warn('Failed to clear sessionStorage:', e)
  }
  
  // Clear all cookies from current domain
  const cookies = document.cookie.split(';')
  for (let cookie of cookies) {
    const [name] = cookie.split('=')
    const cookieName = name.trim()
    if (cookieName) {
      // Try multiple deletion strategies
      const deletionStrategies = [
        `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`,
        `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`,
        `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname};`,
        `${cookieName}=; max-age=0; path=/;`,
        `${cookieName}=; max-age=0; path=/; domain=${window.location.hostname};`,
      ]
      
      deletionStrategies.forEach(strategy => {
        document.cookie = strategy
      })
    }
  }
  
  // Update app state
  logout()
  
  console.log('Force session clear completed')
}

export const authService = {
  checkSession,
  signIn,
  signUp,
  signOut,
  clearLocalData,
  forceSessionClear,
}
