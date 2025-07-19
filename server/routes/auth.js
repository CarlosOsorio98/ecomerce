import { 
  login, 
  register, 
  logout,
  getSession
} from '../controllers/authController.js'
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

const createAuthRouter = () => {
  const routes = [
    createRoute('POST', '/api/auth/login', login, { requiresAuth: false }),
    createRoute('POST', '/api/auth/register', register, { requiresAuth: false }),
    createRoute('POST', '/api/auth/logout', logout, { requiresAuth: true }),
    createRoute('GET', '/api/auth/session', getSession, { requiresAuth: false }),
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

const authRouter = createAuthRouter()

export const handleAuthRoutes = (req) => authRouter.handle(req)