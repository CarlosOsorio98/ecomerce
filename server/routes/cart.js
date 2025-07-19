import { 
  getCart, 
  addToCart, 
  removeFromCart
} from '../controllers/cartController.js'
import { authMiddleware } from '../middleware/auth.js'
import { asyncHandler } from '../middleware/errorHandler.js'
import {
  createRoute,
  enhanceRequest,
  findMatchingRoute,
} from '../services/routerService.js'

const withAuth = (handler) => async (req) => {
  await authMiddleware(req)
  return handler(req)
}

const createCartRouter = () => {
  const routes = [
    createRoute('GET', '/api/cart', getCart, { requiresAuth: true }),
    createRoute('POST', '/api/cart', addToCart, { requiresAuth: true }),
    createRoute('DELETE', '/api/cart/:id', removeFromCart, { requiresAuth: true }),
  ]

  return {
    handle: async (req) => {
      const url = new URL(req.url)
      const { pathname, searchParams } = url
      const method = req.method

      const match = findMatchingRoute(routes, method, pathname)
      if (!match) return null

      const { route, params } = match

      // Enhance request with params and query
      enhanceRequest(req, params, searchParams)

      const handler = route.requiresAuth
        ? withAuth(route.handler)
        : route.handler

      return asyncHandler(handler)(req)
    },
  }
}

const cartRouter = createCartRouter()

export const handleCartRoutes = (req) => cartRouter.handle(req)