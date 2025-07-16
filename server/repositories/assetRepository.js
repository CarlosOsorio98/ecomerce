import { db } from '@/data/schema.js'

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
