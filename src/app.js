import { config } from '@/config.js'
import { createRouter } from '@/router.js'

import adminHTML from '~/admin.html'
import indexHTML from '~/index.html'

const server = globalThis.Bun.serve({
  port: config.server.port,
  ...createRouter(adminHTML, indexHTML),
})

console.log(`🚀 Server running at ${server.url}`)
