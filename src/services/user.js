import { setUser } from '~/lib/state.js'

const USERS_KEY = 'users'

const updateProfile = async (userId, updateData) => {
  const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]')
  const userIndex = users.findIndex((u) => u.id === userId)

  if (userIndex === -1) {
    throw new Error('Usuario no encontrado')
  }

  const { email, password, id, ...allowedUpdates } = updateData

  users[userIndex] = {
    ...users[userIndex],
    ...allowedUpdates,
    updatedAt: new Date().toISOString(),
  }

  localStorage.setItem(USERS_KEY, JSON.stringify(users))

  const currentUser = JSON.parse(localStorage.getItem('auth_user') || 'null')
  if (currentUser && currentUser.id === userId) {
    const updatedUser = {
      ...currentUser,
      ...allowedUpdates,
    }
    localStorage.setItem('auth_user', JSON.stringify(updatedUser))
    setUser(updatedUser)
  }

  return users[userIndex]
}

const changePassword = async (userId, oldPassword, newPassword) => {
  const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]')
  const userIndex = users.findIndex((u) => u.id === userId)

  if (userIndex === -1) {
    throw new Error('Usuario no encontrado')
  }

  if (users[userIndex].password !== oldPassword) {
    throw new Error('Contraseña actual incorrecta')
  }

  users[userIndex].password = newPassword
  users[userIndex].updatedAt = new Date().toISOString()

  localStorage.setItem(USERS_KEY, JSON.stringify(users))

  return { message: 'Contraseña actualizada exitosamente' }
}

const deleteAccount = async (userId, password) => {
  const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]')
  const userIndex = users.findIndex((u) => u.id === userId)

  if (userIndex === -1) {
    throw new Error('Usuario no encontrado')
  }

  if (users[userIndex].password !== password) {
    throw new Error('Contraseña incorrecta')
  }

  users.splice(userIndex, 1)
  localStorage.setItem(USERS_KEY, JSON.stringify(users))

  const currentUser = JSON.parse(localStorage.getItem('auth_user') || 'null')
  if (currentUser && currentUser.id === userId) {
    localStorage.removeItem('auth_user')
    setUser(null)
  }

  return { message: 'Cuenta eliminada exitosamente' }
}

export const userService = {
  updateProfile,
  changePassword,
  deleteAccount,
}

const API_BASE = '/api'

export const userApi = {
  async register({ name, email, password }) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    })
    if (!res.ok) {
      let errorMsg = 'Error en registro'
      try {
        const errorData = await res.json()
        errorMsg = errorData.error || errorData.message || `HTTP ${res.status}: ${res.statusText}`
      } catch {
        errorMsg = `HTTP ${res.status}: ${res.statusText}`
      }
      throw new Error(errorMsg)
    }
    return res.json()
  },
  async login({ email, password }) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    })
    if (!res.ok) {
      let errorMsg = 'Error en login'
      try {
        const errorData = await res.json()
        errorMsg = errorData.error || errorData.message || `HTTP ${res.status}: ${res.statusText}`
      } catch {
        errorMsg = `HTTP ${res.status}: ${res.statusText}`
      }
      throw new Error(errorMsg)
    }
    return res.json()
  },
}
