import { db } from '../data/schema.js'

export const getCart = () =>
  db
    .query(
      `
    SELECT cart.id, cart.asset_id, cart.quantity, assets.name, assets.price, assets.url
    FROM cart JOIN assets ON cart.asset_id = assets.id
  `
    )
    .all()

export const getCartItemByAssetId = (assetId) =>
  db.query('SELECT * FROM cart WHERE asset_id = ?').get(assetId)

export const addToCart = (assetId, quantity) =>
  db.run('INSERT INTO cart (asset_id, quantity) VALUES (?, ?)', [
    assetId,
    quantity,
  ])

export const updateCartQuantity = (assetId, quantity) =>
  db.run('UPDATE cart SET quantity = ? WHERE asset_id = ?', [quantity, assetId])

export const removeFromCart = (assetId) =>
  db.run('DELETE FROM cart WHERE asset_id = ?', [assetId])

export const removeCartItem = (id) =>
  db.run('DELETE FROM cart WHERE id = ?', [id])
