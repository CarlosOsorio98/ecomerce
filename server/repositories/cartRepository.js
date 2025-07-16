import { db } from '@/data/schema.js'

export const getCart = async () => {
  const result = await db.execute(`
    SELECT cart.id, cart.asset_id, cart.quantity, assets.name, assets.price, assets.url
    FROM cart JOIN assets ON cart.asset_id = assets.id
  `)
  return result.rows
}

export const getCartItemByAssetId = async (assetId) => {
  const result = await db.execute({
    sql: 'SELECT * FROM cart WHERE asset_id = ?',
    args: [assetId]
  })
  return result.rows[0]
}

export const addToCart = async (assetId, quantity) =>
  await db.execute({
    sql: 'INSERT INTO cart (asset_id, quantity) VALUES (?, ?)',
    args: [assetId, quantity]
  })

export const updateCartQuantity = async (assetId, quantity) =>
  await db.execute({
    sql: 'UPDATE cart SET quantity = ? WHERE asset_id = ?',
    args: [quantity, assetId]
  })

export const removeFromCart = async (assetId) =>
  await db.execute({
    sql: 'DELETE FROM cart WHERE asset_id = ?',
    args: [assetId]
  })

export const removeCartItem = async (id) =>
  await db.execute({
    sql: 'DELETE FROM cart WHERE id = ?',
    args: [id]
  })
