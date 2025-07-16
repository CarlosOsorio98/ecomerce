export const createRoute = (method, path, handler, options = {}) => ({
  method,
  path,
  handler,
  middleware: options.middleware || [],
  requiresAuth: options.requiresAuth || false,
  pattern: createPathPattern(path),
})

export const createPathPattern = (path) => {
  if (!path.includes(':')) {
    return { type: 'exact', value: path }
  }

  const pattern = path.replace(/:[^/]+/g, '([^/]+)')
  return {
    type: 'pattern',
    regex: new RegExp(`^${pattern}$`),
    paramNames: (path.match(/:([^/]+)/g) || []).map((p) => p.slice(1)),
  }
}

export const extractParams = (pathname, pattern) => {
  if (pattern.type === 'exact') {
    return pathname === pattern.value ? {} : null
  }

  const match = pathname.match(pattern.regex)
  if (!match) return null

  const params = {}
  pattern.paramNames.forEach((name, index) => {
    params[name] = match[index + 1]
  })
  return params
}

export const findMatchingRoute = (routes, method, pathname) => {
  for (const route of routes) {
    if (route.method !== method) continue

    const params = extractParams(pathname, route.pattern)
    if (params !== null) {
      return { route, params }
    }
  }
  return null
}

export const applyMiddleware = (handler, middleware) => {
  return middleware.reduce(
    (acc, mw) => (req) => mw(req, () => acc(req)),
    handler
  )
}

export const enhanceRequest = (req, params, searchParams) => {
  req.params = params
  req.query = Object.fromEntries(searchParams)
  return req
}
