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

export const getCartItems = async () => await getCart()

export const addItemToCart = async (assetId, quantity) => {
  const asset = await getAssetById(assetId)
  if (!asset) {
    throw createNotFoundError('Product does not exist')
  }

  const existingItem = await getCartItemByAssetId(assetId)

  if (existingItem) {
    const newQuantity = existingItem.quantity + quantity
    if (newQuantity <= 0) {
      await removeFromCart(assetId)
    } else {
      await updateCartQuantity(assetId, newQuantity)
    }
  } else if (quantity > 0) {
    await addToCart(assetId, quantity)
  }

  return { success: true }
}

export const removeItemFromCart = async (id) => {
  await removeCartItem(id)
  return { success: true }
}
