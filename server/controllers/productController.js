import * as productService from '../services/productService.js'
import { getCORSHeaders } from '../middleware/cors.js'

export const getProducts = async (req) => {
  try {
    const products = await productService.getAllProducts()
    return new Response(JSON.stringify(products), {
      status: 200,
      headers: { ...getCORSHeaders(), 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error getting products:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...getCORSHeaders(), 'Content-Type': 'application/json' }
    })
  }
}

export const getProduct = async (req) => {
  try {
    const { id } = req.params
    const product = await productService.getProductById(id)
    
    if (!product) {
      return new Response(JSON.stringify({ error: 'Product not found' }), {
        status: 404,
        headers: { ...getCORSHeaders(), 'Content-Type': 'application/json' }
      })
    }
    
    return new Response(JSON.stringify(product), {
      status: 200,
      headers: { ...getCORSHeaders(), 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error getting product:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...getCORSHeaders(), 'Content-Type': 'application/json' }
    })
  }
}

export const createProduct = async (req) => {
  try {
    const body = await req.json()
    const { name, description, price } = body
    const product = await productService.createProduct(name, description, price)
    return new Response(JSON.stringify(product), {
      status: 201,
      headers: { ...getCORSHeaders(), 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error creating product:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...getCORSHeaders(), 'Content-Type': 'application/json' }
    })
  }
}

export const updateProduct = async (req) => {
  try {
    const { id } = req.params
    const body = await req.json()
    const { name, description, price } = body
    const product = await productService.updateProduct(id, name, description, price)
    
    if (!product) {
      return new Response(JSON.stringify({ error: 'Product not found' }), {
        status: 404,
        headers: { ...getCORSHeaders(), 'Content-Type': 'application/json' }
      })
    }
    
    return new Response(JSON.stringify(product), {
      status: 200,
      headers: { ...getCORSHeaders(), 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error updating product:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...getCORSHeaders(), 'Content-Type': 'application/json' }
    })
  }
}

export const deleteProduct = async (req) => {
  try {
    const { id } = req.params
    const product = await productService.deleteProduct(id)
    
    if (!product) {
      return new Response(JSON.stringify({ error: 'Product not found' }), {
        status: 404,
        headers: { ...getCORSHeaders(), 'Content-Type': 'application/json' }
      })
    }
    
    return new Response(JSON.stringify({ message: 'Product deleted successfully' }), {
      status: 200,
      headers: { ...getCORSHeaders(), 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error deleting product:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...getCORSHeaders(), 'Content-Type': 'application/json' }
    })
  }
}

export const addAssetToProduct = async (req) => {
  try {
    const { id } = req.params
    const formData = await req.formData()
    const imageFile = formData.get('image')
    
    if (!imageFile) {
      return new Response(JSON.stringify({ error: 'Image file is required' }), {
        status: 400,
        headers: { ...getCORSHeaders(), 'Content-Type': 'application/json' }
      })
    }
    
    const asset = await productService.addAssetToProduct(id, imageFile)
    return new Response(JSON.stringify(asset), {
      status: 201,
      headers: { ...getCORSHeaders(), 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error adding asset to product:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...getCORSHeaders(), 'Content-Type': 'application/json' }
    })
  }
}