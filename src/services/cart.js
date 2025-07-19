/* eslint-disable camelcase */
// Service for consuming the cart API with new product schema
const API_BASE = '/api'

const handleApiError = async (res, defaultMessage) => {
  let errorMsg = defaultMessage
  try {
    const errorData = await res.json()
    errorMsg = errorData.error || errorData.message || `HTTP ${res.status}: ${res.statusText}`
  } catch {
    errorMsg = `HTTP ${res.status}: ${res.statusText}`
  }
  throw new Error(errorMsg)
}

export const cartService = {
  async getCart() {
    try {
      const res = await fetch(`${API_BASE}/cart`, {
        credentials: 'include'
      })
      if (!res.ok) {
        await handleApiError(res, 'Error al obtener el carrito')
      }
      return res.json()
    } catch (error) {
      console.error('Cart service error:', error)
      throw error
    }
  },
  async addToCart(product_id, quantity = 1) {
    try {
      const res = await fetch(`${API_BASE}/cart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ product_id, quantity }),
      })
      if (!res.ok) {
        await handleApiError(res, 'Error al agregar al carrito')
      }
      return res.json()
    } catch (error) {
      console.error('Add to cart error:', error)
      throw error
    }
  },
  async removeFromCart(id) {
    try {
      const res = await fetch(`${API_BASE}/cart/${id}`, { 
        method: 'DELETE',
        credentials: 'include'
      })
      if (!res.ok) {
        await handleApiError(res, 'Error al eliminar del carrito')
      }
      return res.json()
    } catch (error) {
      console.error('Remove from cart error:', error)
      throw error
    }
  },
  async updateCartItem(id, quantity) {
    try {
      const res = await fetch(`${API_BASE}/cart/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ quantity }),
      })
      if (!res.ok) {
        await handleApiError(res, 'Error al actualizar el carrito')
      }
      return res.json()
    } catch (error) {
      console.error('Update cart item error:', error)
      throw error
    }
  },
  async clearCart() {
    try {
      const res = await fetch(`${API_BASE}/cart`, {
        method: 'DELETE',
        credentials: 'include'
      })
      if (!res.ok) {
        await handleApiError(res, 'Error al limpiar el carrito')
      }
      return res.json()
    } catch (error) {
      console.error('Clear cart error:', error)
      throw error
    }
  },
}