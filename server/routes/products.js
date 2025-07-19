import * as productController from '../controllers/productController.js'

const productRoutes = [
  {
    method: 'GET',
    path: '/api/products',
    handler: productController.getProducts
  },
  {
    method: 'GET',
    path: '/api/products/:id',
    handler: productController.getProduct
  },
  {
    method: 'POST',
    path: '/api/products',
    handler: productController.createProduct
  },
  {
    method: 'PUT',
    path: '/api/products/:id',
    handler: productController.updateProduct
  },
  {
    method: 'DELETE',
    path: '/api/products/:id',
    handler: productController.deleteProduct
  },
  {
    method: 'POST',
    path: '/api/products/:id/assets',
    handler: productController.addAssetToProduct
  }
]

export const handleProductRoutes = async (req) => {
  const url = new URL(req.url)
  const method = req.method
  const pathname = url.pathname

  for (const route of productRoutes) {
    const pathPattern = route.path.replace(/:[^/]+/g, '([^/]+)')
    const regex = new RegExp(`^${pathPattern}$`)
    const match = pathname.match(regex)

    if (method === route.method && match) {
      // Extract params from URL
      const paramNames = route.path.match(/:([^/]+)/g)?.map(p => p.slice(1)) || []
      const params = {}
      paramNames.forEach((name, index) => {
        params[name] = match[index + 1]
      })

      // Create mock req object with params
      const mockReq = {
        ...req,
        params,
        body: method !== 'GET' ? await req.json().catch(() => ({})) : {},
        files: req.files || {}
      }

      // Create mock res object
      const mockRes = {
        json: (data) => new Response(JSON.stringify(data), {
          headers: { 'Content-Type': 'application/json' }
        }),
        status: (code) => ({
          json: (data) => new Response(JSON.stringify(data), {
            status: code,
            headers: { 'Content-Type': 'application/json' }
          })
        })
      }

      return await route.handler(mockReq, mockRes)
    }
  }

  return new Response(JSON.stringify({ error: 'Product route not found' }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' }
  })
}