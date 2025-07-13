import { config } from '../config.js'

export const getCORSHeaders = () => ({
  'Access-Control-Allow-Origin': config.cors.origin,
  'Access-Control-Allow-Methods': config.cors.methods,
  'Access-Control-Allow-Headers': config.cors.headers,
  'Access-Control-Allow-Credentials': config.cors.credentials.toString(),
})

export const corsMiddleware = (req, res, next) => {
  const headers = getCORSHeaders()
  Object.entries(headers).forEach(([key, value]) => {
    res.headers.set(key, value)
  })

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers })
  }

  return next()
}
