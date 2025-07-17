import { 
  getUserFavorites as getUserFavoritesDB,
  addToFavorites as addToFavoritesDB,
  removeFromFavorites as removeFromFavoritesDB,
  isFavorite as isFavoriteDB
} from '@/repositories/favoritesRepository.js'

export const getUserFavorites = async (userId) => {
  return await getUserFavoritesDB(userId)
}

export const toggleFavorite = async (userId, assetId) => {
  const isCurrentlyFavorite = await isFavoriteDB(userId, assetId)
  
  if (isCurrentlyFavorite) {
    await removeFromFavoritesDB(userId, assetId)
    return { isFavorite: false, action: 'removed' }
  } else {
    await addToFavoritesDB(userId, assetId)
    return { isFavorite: true, action: 'added' }
  }
}

export const checkIsFavorite = async (userId, assetId) => {
  return await isFavoriteDB(userId, assetId)
}