import { authMiddleware } from '@/middleware/auth.js'
import { corsMiddleware } from '@/middleware/cors.js'
import { errorHandler } from '@/middleware/errorHandler.js'
import { staticMiddleware } from '@/middleware/static.js'
import { handleAdminRoutes } from '@/routes/admin.js'
import { handleAssetRoutes } from '@/routes/assets.js'
import { handleAuthRoutes } from '@/routes/auth.js'
import { handleCartRoutes } from '@/routes/cart.js'
import { handleFavoritesRoutes } from '@/routes/favorites.js'

// Factory function to create API route handler
const createAPIRouteHandler = () => {
  const handleAPIRoutes = async (req) => {
    try {
      // CORS
      const corsResult = await corsMiddleware(req)
      if (corsResult) return corsResult

      // Auth (except for /api/auth, /api/admin, and /api/assets)
      const url = new URL(req.url)
      const pathname = url.pathname
      if (!pathname.startsWith('/api/auth') && !pathname.startsWith('/api/admin') && !pathname.startsWith('/api/assets')) {
        const authResult = await authMiddleware(req)
        if (authResult) return authResult
      }

      let response = null
      if (pathname.startsWith('/api/auth')) {
        response = await handleAuthRoutes(req)
      } else if (pathname.startsWith('/api/admin')) {
        response = await handleAdminRoutes(req)
      } else if (pathname.startsWith('/api/assets')) {
        response = await handleAssetRoutes(req)
      } else if (pathname.startsWith('/api/cart')) {
        response = await handleCartRoutes(req)
      } else if (pathname.startsWith('/api/favorites')) {
        response = await handleFavoritesRoutes(req)
      }

      // Always add CORS headers to API responses
      const { getCORSHeaders } = await import('@/middleware/cors.js')
      const corsHeaders = getCORSHeaders()

      if (!response) {
        return new Response(JSON.stringify({ error: 'API route not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      // If response is already a Response object, merge CORS headers and return
      if (response instanceof Response) {
        // Merge CORS headers
        const newHeaders = new Headers(response.headers)
        Object.entries(corsHeaders).forEach(([key, value]) => {
          newHeaders.set(key, value)
        })

        return new Response(await response.text(), {
          status: response.status,
          headers: newHeaders,
        })
      }

      // For non-Response objects, ensure proper JSON stringification
      let responseBody
      const contentType = 'application/json'

      if (typeof response === 'object') {
        try {
          responseBody = JSON.stringify(response)
        } catch (err) {
          console.error('Error stringifying response:', err)
          responseBody = JSON.stringify({ error: 'Invalid response format' })
        }
      } else {
        // Convert non-object responses to JSON format
        responseBody = JSON.stringify({ data: String(response) })
      }

      return new Response(responseBody, {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': contentType },
      })
    } catch (err) {
      return errorHandler(err)
    }
  }

  return handleAPIRoutes
}

// Factory function to create static file handler
const createStaticFileHandler = () => {
  return staticMiddleware
}

// Factory function to create the router configuration
const createRouter = (adminHTML, indexHTML) => {
  return {
    routes: {
      // Admin panel
      '/admin': adminHTML,
      // API routes
      '/api/*': createAPIRouteHandler(),
      // Static files
      '/src/*': createStaticFileHandler(),
      // SPA fallback - serve main app for all other routes
      '/*': indexHTML,
    },
    development: process.env.NODE_ENV !== 'production' && {
      hmr: true,
      console: true,
    },
  }
}

export { createRouter }
