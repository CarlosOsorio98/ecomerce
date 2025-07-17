import { db } from '@/data/schema.js'

export const getUserFavorites = async (userId) => {
  const result = await db.execute({
    sql: `SELECT f.*, a.name, a.price, a.url 
          FROM favorites f 
          JOIN assets a ON f.asset_id = a.id 
          WHERE f.user_id = ? 
          ORDER BY f.created_at DESC`,
    args: [userId]
  })
  return result.rows
}

export const addToFavorites = async (userId, assetId) => {
  try {
    await db.execute({
      sql: 'INSERT INTO favorites (user_id, asset_id) VALUES (?, ?)',
      args: [userId, assetId]
    })
    return true
  } catch (error) {
    // If it's a unique constraint violation, the item is already in favorites
    if (error.message?.includes('UNIQUE constraint failed')) {
      return false
    }
    throw error
  }
}

export const removeFromFavorites = async (userId, assetId) => {
  const result = await db.execute({
    sql: 'DELETE FROM favorites WHERE user_id = ? AND asset_id = ?',
    args: [userId, assetId]
  })
  return result.rowsAffected > 0
}

export const isFavorite = async (userId, assetId) => {
  const result = await db.execute({
    sql: 'SELECT 1 FROM favorites WHERE user_id = ? AND asset_id = ?',
    args: [userId, assetId]
  })
  return result.rows.length > 0
}