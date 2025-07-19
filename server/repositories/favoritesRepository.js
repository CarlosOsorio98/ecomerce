import { eq, and, desc } from 'drizzle-orm'
import { db, favorites, products, assets } from '../data/schema.drizzle.js'

export const getUserFavorites = async (userId) => {
  const result = await db
    .select({
      id: favorites.id,
      product_id: favorites.productId,
      created_at: favorites.createdAt,
      name: products.name,
      price: products.price,
      url: assets.url
    })
    .from(favorites)
    .innerJoin(products, eq(favorites.productId, products.id))
    .leftJoin(assets, eq(products.id, assets.productId))
    .where(eq(favorites.userId, userId))
    .orderBy(desc(favorites.createdAt))
  
  return result
}

export const addToFavorites = async (userId, productId) => {
  try {
    await db.insert(favorites).values({
      userId,
      productId
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

export const removeFromFavorites = async (userId, productId) => {
  const result = await db
    .delete(favorites)
    .where(and(eq(favorites.userId, userId), eq(favorites.productId, productId)))
  
  return result.changes > 0
}

export const isFavorite = async (userId, productId) => {
  const result = await db
    .select({ id: favorites.id })
    .from(favorites)
    .where(and(eq(favorites.userId, userId), eq(favorites.productId, productId)))
    .limit(1)
  
  return result.length > 0
}