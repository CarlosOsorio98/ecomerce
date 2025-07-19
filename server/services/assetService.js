import { 
  getAllAssets, 
  createAsset as createAssetDB, 
  updateAsset as updateAssetDB, 
  deleteAsset as deleteAssetDB 
} from '../repositories/assetRepository.js'

import {
  getAllProducts,
  createProduct as createProductDB,
  updateProduct as updateProductDB,
  deleteProduct as deleteProductDB
} from '../repositories/productRepository.js'

// Product operations
export const getProducts = async () => await getAllProducts()

export const createProduct = async (name, description, price) => {
  return await createProductDB(name, description, price)
}

export const updateProduct = async (productId, name, description, price) => {
  return await updateProductDB(productId, name, description, price)
}

export const deleteProduct = async (productId) => {
  return await deleteProductDB(productId)
}

// Asset operations
export const getAssets = async () => await getAllAssets()

export const createAsset = async (productId, url, urlLocal) => {
  return await createAssetDB(productId, url, urlLocal)
}

export const updateAsset = async (assetId, url, urlLocal) => {
  return await updateAssetDB(assetId, url, urlLocal)
}

export const deleteAsset = async (assetId) => {
  return await deleteAssetDB(assetId)
}
