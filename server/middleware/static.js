import { getCORSHeaders } from './cors.js'

export const staticMiddleware = async (req) => {
  const url = new URL(req.url)
  let filePath = decodeURIComponent(url.pathname)

  if (filePath === '/' || filePath === '') {
    filePath = '/index.html'
  }

  try {
    const file = Bun.file(`.${filePath}`)
    if (await file.exists()) {
      return new Response(file, {
        headers: getCORSHeaders(),
      })
    }

    const indexFile = Bun.file('./frontend/index.html')
    return new Response(indexFile, {
      headers: { ...getCORSHeaders(), 'Content-Type': 'text/html' },
    })
  } catch {
    return new Response('404 Not Found', {
      status: 404,
      headers: getCORSHeaders(),
    })
  }
}
