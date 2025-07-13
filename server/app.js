import { config } from './config.js'
import { localData } from './data/local.js'
import { router } from './router.js'

localData().syncAssets()

const server = Bun.serve({
  port: config.server.port,
  fetch: router,
})

console.log(`🚀 Server running on http://localhost:${config.server.port}`)
