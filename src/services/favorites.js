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

  async toggleFavorite(assetId) {
    const response = await fetch(`/api/favorites/${assetId}`, {
      method: 'POST',
      credentials: 'include'
    })
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return response.json()
  },

  async checkIsFavorite(assetId) {
    const response = await fetch(`/api/favorites/check?assetId=${assetId}`, {
      credentials: 'include'
    })
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return response.json()
  }
}