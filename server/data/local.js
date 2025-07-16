import fs from 'fs'
import { db } from './schema.js'

const ASSETS_PATH = 'frontend/assets.json'
const DEFAULT_ASSETS_PATH = 'frontend/default.assets.json'

function ensureAssetsFile() {
  if (!fs.existsSync(ASSETS_PATH)) {
    if (fs.existsSync(DEFAULT_ASSETS_PATH)) {
      fs.copyFileSync(DEFAULT_ASSETS_PATH, ASSETS_PATH)
    } else {
      fs.writeFileSync(ASSETS_PATH, '[]')
    }
  }
}

function getProducts() {
  ensureAssetsFile()
  return JSON.parse(fs.readFileSync(ASSETS_PATH, 'utf-8'))
}

function getProduct(id) {
  return getProducts().find((product) => product.id === id)
}

async function addProduct(product) {
  const products = getProducts()
  products.push(product)
  fs.writeFileSync(ASSETS_PATH, JSON.stringify(products, null, 2))
  console.log('Guardando producto', product)
  try {
    await db.execute({
      sql: `INSERT INTO assets (id, name, url, price) VALUES (?, ?, ?, ?)`,
      args: [product.id, product.name, product.url, product.price]
    })
  } catch (error) {
    console.error('Error inserting into database', error)
  }
}

async function deleteProduct(id) {
  const products = getProducts()
  const index = products.findIndex((product) => product.id === id)
  if (index !== -1) {
    products.splice(index, 1)
    fs.writeFileSync(ASSETS_PATH, JSON.stringify(products, null, 2))
    await db.execute({
      sql: `DELETE FROM assets WHERE id = ?`,
      args: [id]
    })
  }
}

async function syncAssets() {
  ensureAssetsFile()
  const fileProducts = getProducts()
  
  // Get existing assets from database
  const dbResult = await db.execute('SELECT * FROM assets')
  const dbProducts = dbResult.rows || []
  
  // Create maps for efficient lookup
  const fileProductsMap = new Map(fileProducts.map(p => [p.id, p]))
  const dbProductsMap = new Map(dbProducts.map(p => [p.id, p]))
  
  // Insert new products (exist in file but not in DB)
  for (const [id, product] of fileProductsMap) {
    if (!dbProductsMap.has(id)) {
      await db.execute({
        sql: `INSERT INTO assets (id, name, url, price) VALUES (?, ?, ?, ?)`,
        args: [product.id, product.name, product.url, product.price]
      })
      console.log(`Added new asset: ${product.name}`)
    }
  }
  
  // Update existing products if they've changed
  for (const [id, product] of fileProductsMap) {
    const dbProduct = dbProductsMap.get(id)
    if (dbProduct && (
      dbProduct.name !== product.name ||
      dbProduct.price !== product.price ||
      dbProduct.url !== product.url
    )) {
      await db.execute({
        sql: `UPDATE assets SET name = ?, price = ?, url = ? WHERE id = ?`,
        args: [product.name, product.price, product.url, product.id]
      })
      console.log(`Updated asset: ${product.name}`)
    }
  }
  
  // Remove products that no longer exist in file
  for (const [id, dbProduct] of dbProductsMap) {
    if (!fileProductsMap.has(id)) {
      // First remove any cart items referencing this asset
      await db.execute({
        sql: `DELETE FROM cart WHERE asset_id = ?`,
        args: [id]
      })
      // Then remove the asset
      await db.execute({
        sql: `DELETE FROM assets WHERE id = ?`,
        args: [id]
      })
      console.log(`Removed asset: ${dbProduct.name}`)
    }
  }
}

export function localData() {
  return {
    getProducts,
    getProduct,
    addProduct,
    deleteProduct,
    ensureAssetsFile,
    syncAssets,
  }
}
