// Service for consuming the products API
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

export const productsService = {
  async getAllProducts() {
    try {
      const res = await fetch(`${API_BASE}/products`, {
        credentials: 'include'
      })
      if (!res.ok) {
        await handleApiError(res, 'Error al obtener los productos')
      }
      return res.json()
    } catch (error) {
      console.error('Products service error:', error)
      throw error
    }
  },
  
  async getProductById(id) {
    try {
      const res = await fetch(`${API_BASE}/products/${id}`, {
        credentials: 'include'
      })
      if (!res.ok) {
        await handleApiError(res, 'Error al obtener el producto')
      }
      return res.json()
    } catch (error) {
      console.error('Product by ID service error:', error)
      throw error
    }
  }
}