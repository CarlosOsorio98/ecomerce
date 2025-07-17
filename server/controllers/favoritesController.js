import { getCORSHeaders } from '@/middleware/cors.js'
import { requireAuth } from '@/middleware/auth.js'
import { getUserFavorites, toggleFavorite, checkIsFavorite } from '@/services/favoritesService.js'

export const getFavorites = async (req) => {
  const user = await requireAuth(req)
  const favorites = await getUserFavorites(user.id)

  return new Response(JSON.stringify(favorites), {
    status: 200,
    headers: { ...getCORSHeaders(), 'Content-Type': 'application/json' }
  })
}

export const toggleFavoriteAsset = async (req) => {
  const user = await requireAuth(req)
  const url = new URL(req.url)
  const assetId = url.pathname.split('/').pop()

  if (!assetId) {
    return new Response(JSON.stringify({ error: 'Asset ID is required' }), {
      status: 400,
      headers: { ...getCORSHeaders(), 'Content-Type': 'application/json' }
    })
  }

  const result = await toggleFavorite(user.id, assetId)

  return new Response(JSON.stringify(result), {
    status: 200,
    headers: { ...getCORSHeaders(), 'Content-Type': 'application/json' }
  })
}

export const checkFavoriteStatus = async (req) => {
  const user = await requireAuth(req)
  const url = new URL(req.url)
  const assetId = url.searchParams.get('assetId')

  if (!assetId) {
    return new Response(JSON.stringify({ error: 'Asset ID is required' }), {
      status: 400,
      headers: { ...getCORSHeaders(), 'Content-Type': 'application/json' }
    })
  }

  const isFavorite = await checkIsFavorite(user.id, assetId)

  return new Response(JSON.stringify({ isFavorite }), {
    status: 200,
    headers: { ...getCORSHeaders(), 'Content-Type': 'application/json' }
  })
}