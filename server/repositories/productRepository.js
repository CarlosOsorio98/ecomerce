import { randomUUID } from 'crypto'
import { eq } from 'drizzle-orm'
import { db, products, assets, productSizes } from '../data/schema.drizzle.js'

export const getAllProducts = async () => {
  const result = await db
    .select()
    .from(products)
    .leftJoin(assets, eq(products.id, assets.productId))
    .leftJoin(productSizes, eq(products.id, productSizes.productId))
  
  // Group assets and sizes by product
  const productMap = new Map()
  
  result.forEach(row => {
    const product = row.products
    const asset = row.assets
    const size = row.product_sizes
    
    if (!productMap.has(product.id)) {
      productMap.set(product.id, {
        ...product,
        assets: [],
        sizes: []
      })
    }
    
    if (asset && !productMap.get(product.id).assets.find(a => a.id === asset.id)) {
      productMap.get(product.id).assets.push(asset)
    }
    
    if (size && !productMap.get(product.id).sizes.find(s => s.id === size.id)) {
      productMap.get(product.id).sizes.push(size)
    }
  })
  
  // Calculate average price from sizes, set to 0 if no sizes
  return Array.from(productMap.values()).map(product => {
    if (product.sizes.length > 0) {
      const avgPrice = product.sizes.reduce((sum, size) => sum + size.price, 0) / product.sizes.length
      return { ...product, price: avgPrice, hasSizes: true }
    }
    // If no sizes, this product should not be purchasable without sizes
    return { ...product, price: 0, hasSizes: false }
  })
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
    .leftJoin(productSizes, eq(products.id, productSizes.productId))
    .where(eq(products.id, id))
  
  if (result.length === 0) return null
  
  const product = result[0].products
  const productAssets = result
    .map(row => row.assets)
    .filter(Boolean)
    .filter((asset, index, arr) => arr.findIndex(a => a?.id === asset?.id) === index)
  
  const productSizesData = result
    .map(row => row.product_sizes)
    .filter(Boolean)
    .filter((size, index, arr) => arr.findIndex(s => s?.id === size?.id) === index)
  
  // Calculate pricing information
  let finalProduct = { ...product, assets: productAssets, sizes: productSizesData }
  
  if (productSizesData.length > 0) {
    const avgPrice = productSizesData.reduce((sum, size) => sum + size.price, 0) / productSizesData.length
    finalProduct.price = avgPrice
    finalProduct.hasSizes = true
  } else {
    finalProduct.price = 0
    finalProduct.hasSizes = false
  }
  
  return finalProduct
}

export const createProduct = async (name, description) => {
  const id = randomUUID()
  
  await db.insert(products).values({
    id,
    name,
    description
  })
  
  return { id, name, description }
}

export const updateProduct = async (id, name, description) => {
  const updateData = {}
  
  if (name !== undefined) updateData.name = name
  if (description !== undefined) updateData.description = description
  
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

export const createProductSize = async (productId, size, price, stock = 0) => {
  const result = await db.insert(productSizes).values({
    productId,
    size,
    price,
    stock
  }).returning()
  
  return result[0]
}

export const updateProductSize = async (sizeId, size, price, stock) => {
  const updateData = {}
  
  if (size !== undefined) updateData.size = size
  if (price !== undefined) updateData.price = price
  if (stock !== undefined) updateData.stock = stock
  
  const result = await db
    .update(productSizes)
    .set(updateData)
    .where(eq(productSizes.id, sizeId))
    .returning()
  
  return result[0]
}

export const deleteProductSize = async (sizeId) => {
  const result = await db
    .delete(productSizes)
    .where(eq(productSizes.id, sizeId))
    .returning()
  
  return result[0]
}

export const getProductSizes = async (productId) => {
  return await db
    .select()
    .from(productSizes)
    .where(eq(productSizes.productId, productId))
}