export const createError = (
  type,
  message,
  statusCode = 500,
  details = null
) => ({
  type,
  message,
  statusCode,
  details,
  timestamp: new Date().toISOString(),
})

export const createValidationError = (message, details = null) =>
  createError('VALIDATION_ERROR', message, 400, details)

export const createAuthError = (message = 'Unauthorized') =>
  createError('AUTH_ERROR', message, 401)

export const createNotFoundError = (message = 'Resource not found') =>
  createError('NOT_FOUND_ERROR', message, 404)

export const createConflictError = (message = 'Conflict') =>
  createError('CONFLICT_ERROR', message, 409)

export const createInternalError = (message = 'Internal server error') =>
  createError('INTERNAL_ERROR', message, 500)

export const isAppError = (error) => error && error.type && error.statusCode

export const formatErrorResponse = (error) => {
  if (isAppError(error)) {
    return {
      error: {
        type: error.type,
        message: error.message,
        ...(error.details && { details: error.details }),
        timestamp: error.timestamp,
      },
    }
  }

  return {
    error: {
      type: 'INTERNAL_ERROR',
      message: 'Internal server error',
      timestamp: new Date().toISOString(),
    },
  }
}
