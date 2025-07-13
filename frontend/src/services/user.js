/**
 * @file user.js
 * @description
 * Este archivo define el `UserService`, que se encarga de toda la lógica
 * relacionada con la gestión de los datos de un usuario, como actualizar su perfil,
 * cambiar su contraseña o eliminar su cuenta.
 *
 * Al igual que `AuthService`, este es un servicio **simulado** que utiliza
 * `localStorage` como si fuera una base de datos. En una aplicación real,
 * estos métodos harían llamadas a una API REST para realizar estas operaciones
 * de forma segura en un servidor.
 */
import { setUser } from '../state.js'

export class UserService {
  constructor() {
    // La clave para nuestra "tabla" de usuarios en localStorage.
    this.USERS_KEY = 'users'
  }

  /**
   * Actualiza los datos del perfil de un usuario.
   * @param {string} userId - El ID del usuario a actualizar.
   * @param {object} updateData - Un objeto con los datos a cambiar (ej. { name: 'Nuevo Nombre' }).
   * @returns {Promise<object>} Una promesa que se resuelve con el objeto del usuario actualizado.
   * @throws {Error} Si el usuario no se encuentra.
   */
  async updateProfile(userId, updateData) {
    const users = JSON.parse(localStorage.getItem(this.USERS_KEY) || '[]')
    const userIndex = users.findIndex((u) => u.id === userId)

    if (userIndex === -1) {
      throw new Error('Usuario no encontrado')
    }

    // Medida de seguridad: nos aseguramos de que datos sensibles como el email,
    // la contraseña o el ID no puedan ser modificados a través de esta función.
    const { email, password, id, ...allowedUpdates } = updateData

    // Creamos el objeto del usuario actualizado combinando los datos antiguos
    // con los nuevos permitidos, usando el spread operator (`...`).
    users[userIndex] = {
      ...users[userIndex],
      ...allowedUpdates,
      updatedAt: new Date().toISOString(),
    }

    // Guardamos la lista de usuarios actualizada en localStorage.
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users))

    // Si el usuario que se actualizó es el que tiene la sesión iniciada,
    // también debemos actualizar la información de la sesión.
    const currentUser = JSON.parse(localStorage.getItem('auth_user') || 'null')
    if (currentUser && currentUser.id === userId) {
      const updatedUser = {
        ...currentUser,
        ...allowedUpdates,
      }
      localStorage.setItem('auth_user', JSON.stringify(updatedUser))
      // Y actualizamos el estado global para que la UI reaccione (ej. mostrar el nuevo nombre).
      setUser(updatedUser)
    }

    return users[userIndex]
  }

  /**
   * Cambia la contraseña de un usuario.
   * @param {string} userId - El ID del usuario.
   * @param {string} oldPassword - La contraseña actual para verificación.
   * @param {string} newPassword - La nueva contraseña.
   * @returns {Promise<object>} Una promesa que se resuelve con un mensaje de éxito.
   * @throws {Error} Si el usuario no se encuentra o la contraseña actual es incorrecta.
   */
  async changePassword(userId, oldPassword, newPassword) {
    const users = JSON.parse(localStorage.getItem(this.USERS_KEY) || '[]')
    const userIndex = users.findIndex((u) => u.id === userId)

    if (userIndex === -1) {
      throw new Error('Usuario no encontrado')
    }

    // Verificación de seguridad: nos aseguramos de que el usuario conoce su contraseña actual.
    if (users[userIndex].password !== oldPassword) {
      throw new Error('Contraseña actual incorrecta')
    }

    // Actualizamos la contraseña y la fecha de modificación.
    users[userIndex].password = newPassword
    users[userIndex].updatedAt = new Date().toISOString()

    localStorage.setItem(this.USERS_KEY, JSON.stringify(users))

    return { message: 'Contraseña actualizada exitosamente' }
  }

  /**
   * Elimina la cuenta de un usuario.
   * @param {string} userId - El ID del usuario a eliminar.
   * @param {string} password - La contraseña del usuario para confirmar la eliminación.
   * @returns {Promise<object>} Una promesa que se resuelve con un mensaje de éxito.
   * @throws {Error} Si el usuario no se encuentra o la contraseña es incorrecta.
   */
  async deleteAccount(userId, password) {
    const users = JSON.parse(localStorage.getItem(this.USERS_KEY) || '[]')
    const userIndex = users.findIndex((u) => u.id === userId)

    if (userIndex === -1) {
      throw new Error('Usuario no encontrado')
    }

    // Verificación de seguridad final antes de una acción destructiva.
    if (users[userIndex].password !== password) {
      throw new Error('Contraseña incorrecta')
    }

    // `splice` modifica el array, eliminando el usuario en la posición encontrada.
    users.splice(userIndex, 1)
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users))

    // Si el usuario que se elimina es el que tenía la sesión activa,
    // debemos limpiar completamente su sesión.
    const currentUser = JSON.parse(localStorage.getItem('auth_user') || 'null')
    if (currentUser && currentUser.id === userId) {
      localStorage.removeItem('auth_user')
      // Ponemos el usuario en el estado a `null` para que la app reaccione (logout).
      setUser(null)
    }

    return { message: 'Cuenta eliminada exitosamente' }
  }
}

// Exportamos una instancia única (Singleton) para mantener la consistencia en toda la app.
export const userService = new UserService()

// Servicio para consumir la API de usuarios
const API_BASE = '/api'

export const userApi = {
  async register({ name, email, password }) {
    const res = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    })
    if (!res.ok)
      throw new Error((await res.json()).error || 'Error en registro')
    return res.json()
  },
  async login({ email, password }) {
    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    })
    if (!res.ok) throw new Error((await res.json()).error || 'Error en login')
    return res.json()
  },
}
