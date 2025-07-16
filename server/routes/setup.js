import { getAssetsList } from '@/controllers/assetController.js'
import {
  getSession,
  login,
  logout,
  register,
} from '@/controllers/authController.js'
import {
  addToCart,
  getCart,
  removeFromCart,
} from '@/controllers/cartController.js'
import { getCORSHeaders } from '@/middleware/cors.js'
import { asyncHandler } from '@/middleware/errorHandler.js'
import { staticMiddleware } from '@/middleware/static.js'
import {
  applyMiddleware,
  createRoute,
  enhanceRequest,
  findMatchingRoute,
} from '@/services/routerService.js'
import { handleAdminRoutes } from './admin.js'

const createMainRouter = () => {
  const routes = [
    createRoute('POST', '/api/register', register),
    createRoute('POST', '/api/login', login),
    createRoute('GET', '/api/session', getSession),
    createRoute('POST', '/api/logout', logout),
    createRoute('GET', '/api/cart', getCart),
    createRoute('POST', '/api/cart', addToCart),
    createRoute('DELETE', '/api/cart/:id', removeFromCart),
    createRoute('GET', '/api/assets', getAssetsList),
  ]

  return {
    addRoute: (method, path, handler, options = {}) => {
      routes.push(createRoute(method, path, handler, options))
    },

    handle: async (req) => {
      const url = new URL(req.url)
      const { pathname, searchParams } = url
      const method = req.method

      // Handle CORS preflight
      if (method === 'OPTIONS') {
        return new Response(null, {
          status: 204,
          headers: getCORSHeaders(),
        })
      }

      // Handle admin routes
      if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
        return handleAdminRoutes(req)
      }

      // Find matching route
      const match = findMatchingRoute(routes, method, pathname)
      if (!match) {
        return staticMiddleware(req)
      }

      const { route, params } = match

      // Enhance request with params and query
      enhanceRequest(req, params, searchParams)

      // Apply middleware and execute handler
      const enhancedHandler = applyMiddleware(route.handler, route.middleware)
      return asyncHandler(enhancedHandler)(req)
    },

    getRoutes: () => routes,
  }
}

const mainRouter = createMainRouter()

export const router = (req) => mainRouter.handle(req)
export const addRoute = (method, path, handler, middleware) =>
  mainRouter.addRoute(method, path, handler, middleware)
export const getRoutes = () => mainRouter.getRoutes()
