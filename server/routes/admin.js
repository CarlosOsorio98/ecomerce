import {
  addAsset,
  getAdminPanel,
  getAssets,
  removeAsset,
  updateAsset,
} from '@/controllers/adminController.js'
import { adminMiddleware } from '@/middleware/auth.js'
import { asyncHandler } from '@/middleware/errorHandler.js'
import {
  createRoute,
  enhanceRequest,
  findMatchingRoute,
} from '@/services/routerService.js'

const withAuth = (handler) => async (req) => {
  adminMiddleware(req)
  return handler(req)
}

const createAdminRouter = () => {
  const routes = [
    createRoute('GET', '/admin', getAdminPanel, { requiresAuth: false }),
    createRoute('GET', '/api/admin/assets', getAssets, { requiresAuth: true }),
    createRoute('POST', '/api/admin/assets', addAsset, { requiresAuth: true }),
    createRoute('PUT', '/api/admin/assets/:id', updateAsset, {
      requiresAuth: true,
    }),
    createRoute('DELETE', '/api/admin/assets/:id', removeAsset, {
      requiresAuth: true,
    }),
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

const adminRouter = createAdminRouter()

export const handleAdminRoutes = (req) => adminRouter.handle(req)
