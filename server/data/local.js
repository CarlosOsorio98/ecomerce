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

function addProduct(product) {
  const products = getProducts()
  products.push(product)
  fs.writeFileSync(ASSETS_PATH, JSON.stringify(products, null, 2))
  console.log('Guardando producto', product)
  try {
    db.run(`INSERT INTO assets (id, name, url, price) VALUES (?, ?, ?, ?)`, [
      product.id,
      product.name,
      product.url,
      product.price,
    ])
  } catch (error) {
    console.error('Error inserting into database', error)
  }
}

function deleteProduct(id) {
  const products = getProducts()
  const index = products.findIndex((product) => product.id === id)
  if (index !== -1) {
    products.splice(index, 1)
    fs.writeFileSync(ASSETS_PATH, JSON.stringify(products, null, 2))
    db.run(`DELETE FROM assets WHERE id = ?`, [id])
  }
}

function syncAssets() {
  ensureAssetsFile()
  const products = getProducts()
  // Limpiar la tabla assets
  db.run('DELETE FROM assets')
  // Insertar todos los productos de assets.json
  for (const product of products) {
    db.run(`INSERT INTO assets (id, name, url, price) VALUES (?, ?, ?, ?)`, [
      product.id,
      product.name,
      product.url,
      product.price,
    ])
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
