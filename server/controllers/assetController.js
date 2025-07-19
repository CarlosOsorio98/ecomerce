import { getCORSHeaders } from '../middleware/cors.js'
import { getProducts, createProduct, createAsset } from '../services/assetService.js'
import { processAndSaveImage } from '../services/imageService.js'

export const getProductsList = async (req) => {
  const products = await getProducts()

  return new Response(JSON.stringify(products), {
    status: 200,
    headers: { ...getCORSHeaders(), 'Content-Type': 'application/json' },
  })
}

export const uploadProductWithImage = async (req) => {
  try {
    const formData = await req.formData()
    const file = formData.get('file')
    const name = formData.get('name')
    const description = formData.get('description') || ''
    const price = formData.get('price')

    if (!file || !name || !price) {
      return new Response(JSON.stringify({ error: 'Missing required fields: file, name, price' }), {
        status: 400,
        headers: { ...getCORSHeaders(), 'Content-Type': 'application/json' },
      })
    }

    // Create the product first
    const product = await createProduct(name, description, parseFloat(price))
    
    // Save the image and get the URL
    const imageUrl = await processAndSaveImage(file, file.name)
    
    // Create the asset linked to the product
    const asset = await createAsset(product.id, imageUrl, imageUrl)

    return new Response(JSON.stringify({ product, asset }), {
      status: 201,
      headers: { ...getCORSHeaders(), 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error uploading product with image:', error)
    return new Response(JSON.stringify({ error: 'Failed to upload product' }), {
      status: 500,
      headers: { ...getCORSHeaders(), 'Content-Type': 'application/json' },
    })
  }
}
