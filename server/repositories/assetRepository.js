import { db } from '@/data/schema.js'
import { randomUUID } from 'crypto'

export const getAllAssets = async () => {
  const result = await db.execute('SELECT * FROM assets')
  return result.rows
}

export const getAssetById = async (id) => {
  const result = await db.execute({
    sql: 'SELECT * FROM assets WHERE id = ?',
    args: [id]
  })
  return result.rows[0]
}

export const createAsset = async (name, price, imageUrl) => {
  const id = randomUUID()
  const result = await db.execute({
    sql: 'INSERT INTO assets (id, name, price, url) VALUES (?, ?, ?, ?)',
    args: [id, name, price, imageUrl]
  })
  return { id, name, price, url: imageUrl }
}

export const updateAsset = async (id, name, price, imageUrl) => {
  const updateFields = []
  const args = []
  
  if (name !== undefined) {
    updateFields.push('name = ?')
    args.push(name)
  }
  if (price !== undefined) {
    updateFields.push('price = ?')
    args.push(price)
  }
  if (imageUrl !== undefined) {
    updateFields.push('url = ?')
    args.push(imageUrl)
  }
  
  args.push(id)
  
  const result = await db.execute({
    sql: `UPDATE assets SET ${updateFields.join(', ')} WHERE id = ?`,
    args
  })
  
  return getAssetById(id)
}

export const deleteAsset = async (id) => {
  const asset = await getAssetById(id)
  if (!asset) return null
  
  await db.execute({
    sql: 'DELETE FROM assets WHERE id = ?',
    args: [id]
  })
  
  return asset
}
