import { randomUUID } from 'crypto'
import { eq } from 'drizzle-orm'
import { db, products, assets } from '../data/schema.drizzle.js'

export const getAllProducts = async () => {
  const result = await db
    .select()
    .from(products)
    .leftJoin(assets, eq(products.id, assets.productId))
  
  // Group assets by product
  const productMap = new Map()
  
  result.forEach(row => {
    const product = row.products
    const asset = row.assets
    
    if (!productMap.has(product.id)) {
      productMap.set(product.id, {
        ...product,
        assets: []
      })
    }
    
    if (asset) {
      productMap.get(product.id).assets.push(asset)
    }
  })
  
  return Array.from(productMap.values())
}

export const getProductById = async (id) => {
  const result = await db
    .select()
    .from(products)
    .where(eq(products.id, id))
    .limit(1)
  
  return result[0] || null
}

export const getProductWithAssets = async (id) => {
  const result = await db
    .select()
    .from(products)
    .leftJoin(assets, eq(products.id, assets.productId))
    .where(eq(products.id, id))
  
  if (result.length === 0) return null
  
  const product = result[0].products
  const productAssets = result
    .map(row => row.assets)
    .filter(Boolean)
  
  return {
    ...product,
    assets: productAssets
  }
}

export const createProduct = async (name, description, price) => {
  const id = randomUUID()
  
  await db.insert(products).values({
    id,
    name,
    description,
    price
  })
  
  return { id, name, description, price }
}

export const updateProduct = async (id, name, description, price) => {
  const updateData = {}
  
  if (name !== undefined) updateData.name = name
  if (description !== undefined) updateData.description = description
  if (price !== undefined) updateData.price = price
  
  await db
    .update(products)
    .set(updateData)
    .where(eq(products.id, id))
  
  return getProductById(id)
}

export const deleteProduct = async (id) => {
  const product = await getProductById(id)
  if (!product) return null
  
  // Delete associated assets first (handled by CASCADE in schema)
  await db
    .delete(assets)
    .where(eq(assets.productId, id))
  
  await db
    .delete(products)
    .where(eq(products.id, id))
  
  return product
}