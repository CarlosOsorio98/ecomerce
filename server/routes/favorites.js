import { 
  getFavorites, 
  toggleFavoriteAsset, 
  checkFavoriteStatus
} from '@/controllers/favoritesController.js'

export const handleFavoritesRoutes = async (req) => {
  const url = new URL(req.url)
  const pathname = url.pathname
  const method = req.method

  // GET /api/favorites - Get user's favorites
  if (method === 'GET' && pathname === '/api/favorites') {
    return await getFavorites(req)
  }

  // POST /api/favorites/:assetId - Toggle favorite status
  if (method === 'POST' && pathname.startsWith('/api/favorites/')) {
    return await toggleFavoriteAsset(req)
  }

  // GET /api/favorites/check - Check if asset is favorite
  if (method === 'GET' && pathname === '/api/favorites/check') {
    return await checkFavoriteStatus(req)
  }

  return null
}