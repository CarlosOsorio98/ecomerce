import { createNotFoundError } from '../errors.js'
import { getProductById } from '../repositories/productRepository.js'
import {
  addToCart,
  getCart,
  getCartItemByProductId,
  removeCartItem,
  removeFromCart,
  updateCartQuantity,
  clearCart,
} from '../repositories/cartRepository.js'

export const getCartItems = async (userId) => await getCart(userId)

export const addItemToCart = async (productId, userId, quantity, sizeId = null) => {
  const product = await getProductById(productId)
  if (!product) {
    throw createNotFoundError('Product does not exist')
  }

  const existingItem = await getCartItemByProductId(productId, userId, sizeId)

  if (existingItem) {
    const newQuantity = existingItem.quantity + quantity
    if (newQuantity <= 0) {
      await removeFromCart(productId, userId, sizeId)
    } else {
      await updateCartQuantity(productId, userId, newQuantity, sizeId)
    }
  } else if (quantity > 0) {
    await addToCart(productId, userId, quantity, sizeId)
  }

  return { success: true }
}

export const removeItemFromCart = async (id) => {
  await removeCartItem(id)
  return { success: true }
}

export const clearUserCart = async (userId) => {
  await clearCart(userId)
  return { success: true }
}
