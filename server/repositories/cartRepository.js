import { eq, and } from 'drizzle-orm'
import { db, cart, products, assets } from '../data/schema.drizzle.js'

export const getCart = async (userId) => {
  const result = await db
    .select({
      id: cart.id,
      product_id: cart.productId,
      quantity: cart.quantity,
      name: products.name,
      price: products.price,
      description: products.description,
      url: assets.url
    })
    .from(cart)
    .innerJoin(products, eq(cart.productId, products.id))
    .leftJoin(assets, eq(products.id, assets.productId))
    .where(eq(cart.userId, userId))
  
  return result
}

export const getCartItemByProductId = async (productId, userId) => {
  const result = await db
    .select()
    .from(cart)
    .where(and(eq(cart.productId, productId), eq(cart.userId, userId)))
    .limit(1)
  
  return result[0] || null
}

export const addToCart = async (productId, userId, quantity) => {
  await db.insert(cart).values({
    productId,
    userId,
    quantity
  })
}

export const updateCartQuantity = async (productId, userId, quantity) => {
  await db
    .update(cart)
    .set({ quantity })
    .where(and(eq(cart.productId, productId), eq(cart.userId, userId)))
}

export const removeFromCart = async (productId, userId) => {
  await db
    .delete(cart)
    .where(and(eq(cart.productId, productId), eq(cart.userId, userId)))
}

export const removeCartItem = async (id) => {
  await db
    .delete(cart)
    .where(eq(cart.id, id))
}

export const clearCart = async (userId) => {
  await db
    .delete(cart)
    .where(eq(cart.userId, userId))
}
