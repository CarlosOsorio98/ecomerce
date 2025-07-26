import * as productRepository from '../repositories/productRepository.js'
import * as assetRepository from '../repositories/assetRepository.js'
import { productSchema } from '../data/setup.js'
import { readFileSync, appendFileSync, existsSync, mkdirSync } from 'fs'
import path from 'path'

// Load asset configuration
const assetConfig = JSON.parse(readFileSync(path.resolve('./assets/config.json'), 'utf-8'))

export const getAllProducts = async () => {
  const products = await productRepository.getAllProducts()
  
  // Get assets for each product
  const productsWithAssets = await Promise.all(
    products.map(async (product) => {
      const assets = await assetRepository.getAssetsByProductId(product.id)
      return {
        ...product,
        assets
      }
    })
  )
  
  return productsWithAssets
}

export const getProductById = async (id) => {
  return await productRepository.getProductWithAssets(id)
}

export const createProduct = async (name, description) => {
  // Basic validation without price
  if (!name || typeof name !== 'string') {
    throw new Error('Name is required and must be a string')
  }
  
  return await productRepository.createProduct(name, description)
}

export const updateProduct = async (id, name, description) => {
  return await productRepository.updateProduct(id, name, description)
}

export const deleteProduct = async (id) => {
  return await productRepository.deleteProduct(id)
}

const logAssetOperation = (operation, productId, fileName, fileSize) => {
  if (!assetConfig.local.enable) return
  
  const logDir = path.resolve(assetConfig.local.log_path)
  if (!existsSync(logDir)) {
    mkdirSync(logDir, { recursive: true })
  }
  
  const logFile = path.join(logDir, 'asset-operations.log')
  const timestamp = new Date().toISOString()
  const logEntry = `${timestamp}: ${operation} - Product: ${productId}, File: ${fileName}, Size: ${fileSize} bytes\n`
  
  try {
    appendFileSync(logFile, logEntry)
  } catch (error) {
    console.error('Error writing to log file:', error)
  }
}

export const addAssetToProduct = async (productId, imageFile) => {
  const product = await productRepository.getProductById(productId)
  if (!product) {
    throw new Error('Product not found')
  }
  
  let url = null
  let urlLocal = null
  
  if (assetConfig.local.enable && imageFile) {
    // Use the imageService to process and save the image
    const { processAndSaveImage } = await import('./imageService.js')
    const imageUrl = await processAndSaveImage(imageFile, imageFile.name)
    
    url = imageUrl
    urlLocal = imageUrl
    
    // Log the asset operation
    logAssetOperation('CREATE', productId, imageFile.name, imageFile.size || 0)
  }
  
  return await assetRepository.createAsset(productId, url, urlLocal)
}

// Product sizes service methods
export const getProductSizes = async (productId) => {
  return await productRepository.getProductSizes(productId)
}

export const createProductSize = async (productId, size, price, stock = 0) => {
  return await productRepository.createProductSize(productId, size, price, stock)
}

export const updateProductSize = async (sizeId, size, price, stock) => {
  return await productRepository.updateProductSize(sizeId, size, price, stock)
}

export const deleteProductSize = async (sizeId) => {
  return await productRepository.deleteProductSize(sizeId)
}