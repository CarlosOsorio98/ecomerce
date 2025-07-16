import { config } from './config.js'
import { localData } from './data/local.js'
import { router } from './routes/setup.js'

await localData().syncAssets()

export const server = globalThis.Bun.serve({
  port: config.server.port,
  fetch: router,
})

console.log(`🚀 Server running on http://localhost:${config.server.port}`)
