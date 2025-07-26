import { createNotFoundError, createValidationError } from '../errors.js'
import { getCORSHeaders } from '../middleware/cors.js'
import {
  createAsset,
  deleteAsset,
  getAssets as getAssetsFromDB,
  updateAsset as updateAssetData,
} from '../services/assetService.js'
import * as productService from '../services/productService.js'
import { processAndSaveImage } from '../services/imageService.js'


export const getAssets = async (req) => {
  const assets = await getAssetsFromDB()
  return new Response(JSON.stringify(assets), {
    status: 200,
    headers: { ...getCORSHeaders(), 'Content-Type': 'application/json' },
  })
}

export const addAsset = async (req) => {
  const formData = await req.formData()
  const productId = formData.get('productId')
  const file = formData.get('file')

  if (!productId || !file) {
    throw createValidationError('Missing required data: productId and file')
  }

  const imageUrl = await processAndSaveImage(file, file.name)
  const newAsset = await createAsset(productId, imageUrl, imageUrl)

  return new Response(JSON.stringify(newAsset), {
    status: 201,
    headers: { ...getCORSHeaders(), 'Content-Type': 'application/json' },
  })
}

export const updateAsset = async (req) => {
  const url = new URL(req.url)
  const assetId = url.pathname.split('/').pop()
  const formData = await req.formData()
  
  const file = formData.get('file')

  let imageUrl
  if (file && file.size > 0) {
    imageUrl = await processAndSaveImage(file, file.name)
  }

  const updatedAsset = await updateAssetData(assetId, imageUrl, imageUrl)

  if (!updatedAsset) {
    throw createNotFoundError('Asset not found')
  }

  return new Response(JSON.stringify(updatedAsset), {
    status: 200,
    headers: { ...getCORSHeaders(), 'Content-Type': 'application/json' },
  })
}

export const removeAsset = async (req) => {
  const url = new URL(req.url)
  const assetId = url.pathname.split('/').pop()

  const asset = await deleteAsset(assetId)

  if (!asset) {
    throw createNotFoundError('Asset not found')
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { ...getCORSHeaders(), 'Content-Type': 'application/json' },
  })
}

// Product admin endpoints
export const getProducts = async (req) => {
  const products = await productService.getAllProducts()
  return new Response(JSON.stringify(products), {
    status: 200,
    headers: { ...getCORSHeaders(), 'Content-Type': 'application/json' },
  })
}

export const addProduct = async (req) => {
  const contentType = req.headers.get('Content-Type')
  
  let name, description, file
  
  if (contentType && contentType.includes('application/json')) {
    // Handle JSON request
    const data = await req.json()
    name = data.name
    description = data.description
    file = null
  } else {
    // Handle form data request
    const formData = await req.formData()
    name = formData.get('name')
    description = formData.get('description')
    file = formData.get('file')
  }

  if (!name) {
    throw createValidationError('Missing required data: name')
  }

  const product = await productService.createProduct(name, description)
  
  // Add asset if file is provided
  if (file && file.size > 0) {
    await productService.addAssetToProduct(product.id, file)
  }

  return new Response(JSON.stringify(product), {
    status: 201,
    headers: { ...getCORSHeaders(), 'Content-Type': 'application/json' },
  })
}

export const updateProduct = async (req) => {
  const url = new URL(req.url)
  const productId = url.pathname.split('/').pop()
  const formData = await req.formData()
  
  const name = formData.get('name')
  const description = formData.get('description')
  const file = formData.get('file')

  if (!name) {
    throw createValidationError('Missing required data: name')
  }

  const updatedProduct = await productService.updateProduct(productId, name, description)

  if (!updatedProduct) {
    throw createNotFoundError('Product not found')
  }

  // Add new asset if file is provided
  if (file && file.size > 0) {
    await productService.addAssetToProduct(productId, file)
  }

  return new Response(JSON.stringify(updatedProduct), {
    status: 200,
    headers: { ...getCORSHeaders(), 'Content-Type': 'application/json' },
  })
}

export const removeProduct = async (req) => {
  const url = new URL(req.url)
  const productId = url.pathname.split('/').pop()

  const product = await productService.deleteProduct(productId)

  if (!product) {
    throw createNotFoundError('Product not found')
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { ...getCORSHeaders(), 'Content-Type': 'application/json' },
  })
}

// Product sizes admin endpoints
export const getProductSizes = async (req) => {
  const productId = req.params.id
  
  const sizes = await productService.getProductSizes(productId)
  return new Response(JSON.stringify(sizes), {
    status: 200,
    headers: { ...getCORSHeaders(), 'Content-Type': 'application/json' },
  })
}

export const addProductSize = async (req) => {
  const productId = req.params.id
  const data = await req.json()
  
  const { size, price, stock } = data
  
  if (!size || !price) {
    throw createValidationError('Missing required data: size and price')
  }
  
  const productSize = await productService.createProductSize(productId, size, price, stock)
  
  return new Response(JSON.stringify(productSize), {
    status: 201,
    headers: { ...getCORSHeaders(), 'Content-Type': 'application/json' },
  })
}

export const updateProductSize = async (req) => {
  const sizeId = req.params.id
  const data = await req.json()
  
  const { size, price, stock } = data
  
  const updatedSize = await productService.updateProductSize(sizeId, size, price, stock)
  
  if (!updatedSize) {
    throw createNotFoundError('Product size not found')
  }
  
  return new Response(JSON.stringify(updatedSize), {
    status: 200,
    headers: { ...getCORSHeaders(), 'Content-Type': 'application/json' },
  })
}

export const removeProductSize = async (req) => {
  const sizeId = req.params.id
  
  const size = await productService.deleteProductSize(sizeId)
  
  if (!size) {
    throw createNotFoundError('Product size not found')
  }
  
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { ...getCORSHeaders(), 'Content-Type': 'application/json' },
  })
}
