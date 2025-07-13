import { createNotFoundError } from '@/errors.js'
import { getAssetById } from '@/repositories/assetRepository.js'
import {
  addToCart,
  getCart,
  getCartItemByAssetId,
  removeCartItem,
  removeFromCart,
  updateCartQuantity,
} from '@/repositories/cartRepository.js'

export const getCartItems = () => getCart()

export const addItemToCart = (assetId, quantity) => {
  const asset = getAssetById(assetId)
  if (!asset) {
    throw createNotFoundError('Product does not exist')
  }

  const existingItem = getCartItemByAssetId(assetId)

  if (existingItem) {
    const newQuantity = existingItem.quantity + quantity
    if (newQuantity <= 0) {
      removeFromCart(assetId)
    } else {
      updateCartQuantity(assetId, newQuantity)
    }
  } else if (quantity > 0) {
    addToCart(assetId, quantity)
  }

  return { success: true }
}

export const removeItemFromCart = (id) => {
  removeCartItem(id)
  return { success: true }
}
