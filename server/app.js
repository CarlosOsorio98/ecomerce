import { config } from '@/config.js'
import { router } from '@/routes/setup.js'

export const server = globalThis.Bun.serve({
  port: config.server.port,
  fetch: router,
})

console.log(`🚀 Server running on http://localhost:${config.server.port}`)
