import { randomUUID } from 'crypto'
import { eq } from 'drizzle-orm'
import { db, assets } from '../data/schema.drizzle.js'

export const getAllAssets = async () => {
  const result = await db.select().from(assets)
  return result
}

export const getAssetById = async (id) => {
  const result = await db
    .select()
    .from(assets)
    .where(eq(assets.id, id))
    .limit(1)
  
  return result[0] || null
}

export const getAssetsByProductId = async (productId) => {
  const result = await db
    .select()
    .from(assets)
    .where(eq(assets.productId, productId))
  
  return result
}

export const createAsset = async (productId, url, urlLocal) => {
  const id = randomUUID()
  
  await db.insert(assets).values({
    id,
    url,
    urlLocal,
    productId
  })
  
  return { id, url, url_local: urlLocal, product_id: productId }
}

export const updateAsset = async (id, url, urlLocal) => {
  const updateData = {}
  
  if (url !== undefined) updateData.url = url
  if (urlLocal !== undefined) updateData.urlLocal = urlLocal
  
  await db
    .update(assets)
    .set(updateData)
    .where(eq(assets.id, id))
  
  return getAssetById(id)
}

export const deleteAsset = async (id) => {
  const asset = await getAssetById(id)
  if (!asset) return null
  
  await db
    .delete(assets)
    .where(eq(assets.id, id))
  
  return asset
}
