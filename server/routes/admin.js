// Admin panel configuration
// Uses admin.html template
// Requires admin password equal to .env ADMIN_KEY
// Serves basic admin panel for adding/removing products
// Images are saved in frontend/assets
// Server converts images to WEBP and saves in same directory
// Only WEBP files are preserved
// Updates assets.json when work is done

import {
  addAsset,
  getAdminPanel,
  getAssets,
  removeAsset,
} from '../controllers/adminController.js'
import { adminMiddleware } from '../middleware/auth.js'
import { asyncHandler } from '../middleware/errorHandler.js'

const adminRoutes = [
  ['/admin', 'GET', getAdminPanel],
  ['/api/admin/assets', 'GET', getAssets],
  ['/api/admin/assets', 'POST', addAsset],
  ['/api/admin/assets/:id', 'DELETE', removeAsset],
]

const matchAdminRoute = (pathname, method) => {
  for (const [routePath, routeMethod, handler] of adminRoutes) {
    if (routeMethod === method) {
      if (routePath.includes(':')) {
        const pathPattern = routePath.replace(/:[^/]+/g, '([^/]+)')
        const regex = new RegExp(`^${pathPattern}$`)
        if (regex.test(pathname)) {
          return handler
        }
      } else if (routePath === pathname) {
        return handler
      }
    }
  }
  return null
}

const requireAuth = (handler) => async (req) => {
  adminMiddleware(req)
  return handler(req)
}

export const handleAdminRoutes = async (req) => {
  const url = new URL(req.url)
  const { pathname } = url
  const { method } = req

  const handler = matchAdminRoute(pathname, method)
  if (!handler) return null

  if (pathname === '/admin') {
    return asyncHandler(handler)(req)
  }

  return asyncHandler(requireAuth(handler))(req)
}
