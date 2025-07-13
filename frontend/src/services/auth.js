/**
 * @file auth.js
 * @description
 * Este archivo define el `AuthService` (Servicio de Autenticación).
 * Un "servicio" en arquitectura de software es una clase que encapsula una lógica de negocio específica.
 * En este caso, toda la lógica relacionada con la autenticación de usuarios: iniciar sesión,
 * registrarse, cerrar sesión y verificar la sesión actual.
 */
import { logout, setUser } from '../state.js'
import { userApi } from './user.js'

export class AuthService {
  /**
   * El constructor se ejecuta automáticamente cuando se crea una nueva instancia de la clase.
   * Aquí lo usamos para comprobar si ya existe una sesión de usuario guardada.
   */
  constructor() {
    // No hay sesión persistente en localStorage, solo en memoria
  }

  /**
   * Comprueba si hay una sesión activa en el backend (cookie JWT).
   * Si existe, actualiza el estado global con el usuario autenticado.
   * Además, guarda el resultado en localStorage para debug.
   */
  async checkSession(retries = 2) {
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
            console.debug('[checkSession] No hay sesión activa en el servidor')
            this.clearLocalData()
            return null
          }
          throw new Error(`HTTP ${res.status}: ${res.statusText}`)
        }

        const user = await res.json()
        console.debug(
          '[checkSession] Sesión restaurada desde el servidor:',
          user
        )

        localStorage.setItem('user_session', JSON.stringify(user))
        localStorage.setItem(
          'debug_session',
          JSON.stringify({
            status: res.status,
            ok: res.ok,
            user: user,
            timestamp: new Date().toISOString(),
            attempt: attempt + 1,
          })
        )

        setUser(user)
        return user
      } catch (error) {
        console.error(`[checkSession] Intento ${attempt + 1} falló:`, error)

        if (attempt === retries) {
          this.clearLocalData()
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

        await new Promise((resolve) =>
          setTimeout(resolve, 1000 * (attempt + 1))
        )
      }
    }

    return null
  }

  clearLocalData() {
    localStorage.removeItem('user_session')
    localStorage.removeItem('debug_session')
    localStorage.removeItem('debug_login')
  }

  /**
   * Simula el inicio de sesión de un usuario.
   * @param {string} email - El email del usuario.
   * @param {string} password - La contraseña del usuario.
   * @returns {Promise<object>} Una promesa que se resuelve con los datos del usuario (sin contraseña).
   * @throws {Error} Si las credenciales son inválidas.
   */
  async signIn(email, password) {
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

  /**
   * Simula el registro de un nuevo usuario.
   * @param {object} userData - Datos del nuevo usuario (nombre, email, contraseña).
   * @returns {Promise<object>} Una promesa que se resuelve con los datos del usuario logueado.
   * @throws {Error} Si los datos son inválidos o el email ya existe.
   */
  async signUp(userData) {
    const { email, password, name } = userData

    if (!email || !password || !name) {
      throw new Error('Todos los campos son requeridos')
    }

    const user = await userApi.register({ name, email, password })

    // No loguea automáticamente

    return user
  }

  async signOut() {
    try {
      const res = await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!res.ok) {
        console.warn(
          '[signOut] Error al cerrar sesión en el servidor, pero limpiando sesión local'
        )
      }

      console.log('[signOut] Sesión cerrada correctamente')
    } catch (error) {
      console.error('[signOut] Error al cerrar sesión:', error)
    } finally {
      this.clearLocalData()
      logout()
    }
  }
}

export const authService = new AuthService()
