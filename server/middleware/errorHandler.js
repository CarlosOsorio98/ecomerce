import { formatErrorResponse, isAppError } from '../errors.js'
import { getCORSHeaders } from './cors.js'

export const errorHandler = (error, req) => {
  console.error('[ERROR]', error)

  const errorResponse = formatErrorResponse(error)
  const statusCode = isAppError(error) ? error.statusCode : 500

  return new Response(JSON.stringify(errorResponse), {
    status: statusCode,
    headers: {
      ...getCORSHeaders(),
      'Content-Type': 'application/json',
    },
  })
}

export const asyncHandler = (fn) => async (req) => {
  try {
    return await fn(req)
  } catch (error) {
    return errorHandler(error, req)
  }
}
