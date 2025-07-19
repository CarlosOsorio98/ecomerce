export const favoritesService = {
  async getFavorites() {
    const response = await fetch('/api/favorites', {
      credentials: 'include'
    })
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return response.json()
  },

  async toggleFavorite(productId) {
    const response = await fetch(`/api/favorites/${productId}`, {
      method: 'POST',
      credentials: 'include'
    })
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return response.json()
  },

  async checkIsFavorite(productId) {
    const response = await fetch(`/api/favorites/check?productId=${productId}`, {
      credentials: 'include'
    })
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return response.json()
  }
}