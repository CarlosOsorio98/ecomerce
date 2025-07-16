export function createRoute(method, path, handler, options = {}) {
  return {
    method,
    path,
    handler,
    ...options
  }
}

export function findMatchingRoute(routes, method, pathname) {
  for (const route of routes) {
    if (route.method !== method) continue
    
    const match = matchPath(route.path, pathname)
    if (match) {
      return { route, params: match.params }
    }
  }
  return null
}

export function matchPath(pattern, pathname) {
  // Convert pattern like '/api/admin/assets/:id' to regex
  const paramNames = []
  const regexPattern = pattern.replace(/:[^/]+/g, (match) => {
    paramNames.push(match.slice(1)) // Remove ':'
    return '([^/]+)'
  })
  
  const regex = new RegExp(`^${regexPattern}$`)
  const match = pathname.match(regex)
  
  if (!match) return null
  
  const params = {}
  paramNames.forEach((name, index) => {
    params[name] = match[index + 1]
  })
  
  return { params }
}

export function enhanceRequest(req, params, searchParams) {
  Object.defineProperty(req, 'params', {
    value: params,
    writable: true,
    enumerable: true,
    configurable: true
  })
  Object.defineProperty(req, 'query', {
    value: Object.fromEntries(searchParams.entries()),
    writable: true,
    enumerable: true,
    configurable: true
  })
}