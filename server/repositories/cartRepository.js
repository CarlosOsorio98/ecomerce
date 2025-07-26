import { eq, and } from 'drizzle-orm'
import { db, cart, products, assets, productSizes } from '../data/schema.drizzle.js'

export const getCart = async (userId) => {
  const result = await db
    .select({
      id: cart.id,
      product_id: cart.productId,
      size_id: cart.sizeId,
      quantity: cart.quantity,
      name: products.name,
      price: products.price,
      description: products.description,
      url: assets.url,
      size: productSizes.size,
      size_price: productSizes.price
    })
    .from(cart)
    .innerJoin(products, eq(cart.productId, products.id))
    .leftJoin(assets, eq(products.id, assets.productId))
    .leftJoin(productSizes, eq(cart.sizeId, productSizes.id))
    .where(eq(cart.userId, userId))
  
  return result
}

export const getCartItemByProductId = async (productId, userId, sizeId = null) => {
  const conditions = [eq(cart.productId, productId), eq(cart.userId, userId)]
  if (sizeId) {
    conditions.push(eq(cart.sizeId, sizeId))
  }
  
  const result = await db
    .select()
    .from(cart)
    .where(and(...conditions))
    .limit(1)
  
  return result[0] || null
}

export const addToCart = async (productId, userId, quantity, sizeId = null) => {
  await db.insert(cart).values({
    productId,
    userId,
    quantity,
    sizeId
  })
}

export const updateCartQuantity = async (productId, userId, quantity, sizeId = null) => {
  const conditions = [eq(cart.productId, productId), eq(cart.userId, userId)]
  if (sizeId) {
    conditions.push(eq(cart.sizeId, sizeId))
  }
  
  await db
    .update(cart)
    .set({ quantity })
    .where(and(...conditions))
}

export const removeFromCart = async (productId, userId, sizeId = null) => {
  const conditions = [eq(cart.productId, productId), eq(cart.userId, userId)]
  if (sizeId) {
    conditions.push(eq(cart.sizeId, sizeId))
  }
  
  await db
    .delete(cart)
    .where(and(...conditions))
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
