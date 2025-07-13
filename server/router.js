import { getAssetsList } from './controllers/assetController.js'
import {
  getSession,
  login,
  logout,
  register,
} from './controllers/authController.js'
import {
  addToCart,
  getCart,
  removeFromCart,
} from './controllers/cartController.js'
import { getCORSHeaders } from './middleware/cors.js'
import { asyncHandler } from './middleware/errorHandler.js'
import { staticMiddleware } from './middleware/static.js'
import { handleAdminRoutes } from './routes/admin.js'

const routes = [
  [['POST', '/api/register'], register],
  [['POST', '/api/login'], login],
  [['GET', '/api/session'], getSession],
  [['POST', '/api/logout'], logout],
  [['GET', '/api/cart'], getCart],
  [['POST', '/api/cart'], addToCart],
  [['DELETE', '/api/cart/:id'], removeFromCart],
  [['GET', '/api/assets'], getAssetsList],
]

const matchPath = (routePath, pathname) => {
  if (routePath.includes(':')) {
    const pathPattern = routePath.replace(/:[^/]+/g, '([^/]+)')
    const regex = new RegExp(`^${pathPattern}$`)
    return regex.test(pathname)
  }
  return routePath === pathname
}

const matchRoute = (method, pathname) => {
  for (const [routeConfig, handler] of routes) {
    const [routeMethod, routePath] = routeConfig

    if (Array.isArray(routeMethod)) {
      if (!routeMethod.includes(method)) continue
    } else if (routeMethod !== method) {
      continue
    }

    if (Array.isArray(routePath)) {
      for (const path of routePath) {
        if (matchPath(path, pathname)) {
          return handler
        }
      }
    } else if (matchPath(routePath, pathname)) {
      return handler
    }
  }
  return null
}

export const router = async (req) => {
  const url = new URL(req.url)
  const { method } = req
  const { pathname } = url

  if (method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: getCORSHeaders(),
    })
  }

  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    return handleAdminRoutes(req)
  }

  const handler = matchRoute(method, pathname)
  if (handler) {
    return asyncHandler(handler)(req)
  }

  return staticMiddleware(req)
}

export const addRoute = (methods, paths, handler) => {
  routes.push([[methods, paths], handler])
}

export const getRoutes = () => routes
