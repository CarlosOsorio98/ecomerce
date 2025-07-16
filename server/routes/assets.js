import { getAssetsList } from '@/controllers/assetController.js'
import { asyncHandler } from '@/middleware/errorHandler.js'
import {
  createRoute,
  enhanceRequest,
  findMatchingRoute,
} from '@/services/routerService.js'

const createAssetRouter = () => {
  const routes = [
    createRoute('GET', '/api/assets', getAssetsList, { requiresAuth: false }),
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

      return asyncHandler(route.handler)(req)
    },
  }
}

const assetRouter = createAssetRouter()

export const handleAssetRoutes = (req) => assetRouter.handle(req)