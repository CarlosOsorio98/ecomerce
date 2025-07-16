import { config } from '@/config.js'
import { handleAdminRoutes } from '@/routes/admin.js'
import { handleAssetRoutes } from '@/routes/assets.js'
import { handleAuthRoutes } from '@/routes/auth.js'
import { handleCartRoutes } from '@/routes/cart.js'

import adminHTML from '~/admin.html'
import indexHTML from '~/index.html'

// API route handler
async function handleAPIRoutes(req) {
  const url = new URL(req.url)
  const pathname = url.pathname

  let response = null

  // Auth routes
  if (pathname.startsWith('/api/auth')) {
    response = await handleAuthRoutes(req)
  }
  // Admin routes
  else if (pathname.startsWith('/api/admin')) {
    response = await handleAdminRoutes(req)
  }
  // Asset routes
  else if (pathname.startsWith('/api/assets')) {
    response = await handleAssetRoutes(req)
  }
  // Cart routes
  else if (pathname.startsWith('/api/cart')) {
    response = await handleCartRoutes(req)
  }

  // If no route matched or handler returned null, return 404
  if (!response) {
    return new Response(JSON.stringify({ error: 'API route not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  return response
}

// Static file handler
async function handleStaticFiles(req) {
  const url = new URL(req.url)
  const filePath = url.pathname

  // Handle src static files (assets, etc.)
  if (filePath.startsWith('/src/')) {
    const file = globalThis.Bun.file(`.${filePath}`)
    if (await file.exists()) {
      return new Response(file)
    }
  }

  // Return 404 for static files not found
  return new Response('File not found', {
    status: 404,
    headers: { 'Content-Type': 'text/plain' }
  })
}

const server = globalThis.Bun.serve({
  port: config.server.port,

  routes: {
    // Admin panel
    '/admin': adminHTML,

    // API routes
    '/api/*': handleAPIRoutes,

    // Static files
    '/src/*': handleStaticFiles,

    // SPA fallback - serve main app for all other routes
    '/*': indexHTML,
  },

  development: process.env.NODE_ENV !== 'production' && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
})

console.log(`🚀 Server running at ${server.url}`)
