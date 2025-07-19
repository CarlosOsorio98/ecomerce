import { setCurrentRoute } from './state.js'

export function createElement(tag, props = {}, ...children) {
  const element = document.createElement(tag)

  Object.entries(props).forEach(([key, value]) => {
    if (key === 'className') {
      element.className = value
    } else if (key.startsWith('on') && typeof value === 'function') {
      element.addEventListener(key.toLowerCase().slice(2), value)
    } else {
      element.setAttribute(key, value)
    }
  })

  children.flat().forEach((child) => {
    if (child instanceof Node) {
      element.appendChild(child)
    } else if (child !== null && child !== undefined) {
      element.appendChild(document.createTextNode(child))
    }
  })

  return element
}

export function createRouter(routes) {
  let _routes = routes
  let _rootElement = null
  let _basePath = ''

  const getBasePath = () => {
    const script = document.querySelector('script[src*="frontend.js"]')
    if (script) {
      const scriptPath = script.getAttribute('src')
      const srcIndex = scriptPath.indexOf('src/')
      if (srcIndex !== -1) {
        return scriptPath.substring(0, srcIndex)
      }
    }
    return './'
  }

  const getRelativePath = (path) => {
    const relative = path.startsWith(_basePath)
      ? path.slice(_basePath.length)
      : path
    return `/${relative}`.replace(/\/+/g, '/')
  }

  const updateView = async (route, relativePath) => {
    setCurrentRoute(relativePath)

    try {
      if (_rootElement) {
        console.log('Starting slide animation...')

        // Apply slide-out animation using CSS keyframes
        _rootElement.style.animation = 'slide-out-to-left 3s forwards'

        console.log('Applied slide-out, waiting...')

        // Wait for slide-out animation
        setTimeout(async () => {
          console.log('Loading new view...')
          const view = await route.component()

          // Update content
          _rootElement.innerHTML = ''
          _rootElement.appendChild(view)

          console.log('Content updated, starting slide-in...')

          // Apply slide-in animation using CSS keyframes
          _rootElement.style.animation = 'slide-in-from-right 3s forwards'
          console.log('Slide-in animation started')

          // Clean up after animation
          setTimeout(() => {
            _rootElement.style.animation = ''
            console.log('Animation completed, styles cleaned up')
          }, 500)
        }, 500)
      } else {
        console.error('Elemento raíz no encontrado')
      }
    } catch (error) {
      console.error('Error al renderizar la vista:', error)
    }
  }

  const handleRoute = async () => {
    let path = window.location.pathname
    if (path.endsWith('/') && path.length > 1) {
      path = path.slice(0, -1)
    }

    const relativePath = getRelativePath(path)

    // Check for exact match first
    let route = _routes.find((r) => r.path === relativePath)

    // If no exact match, check for dynamic routes
    if (!route) {
      route = _routes.find((r) => {
        if (r.path.includes(':')) {
          const pathParts = r.path.split('/')
          const relativeParts = relativePath.split('/')

          if (pathParts.length !== relativeParts.length) {
            return false
          }

          return pathParts.every((part, index) => {
            return part.startsWith(':') || part === relativeParts[index]
          })
        }
        return false
      })
    }

    // Fallback to wildcard route
    if (!route) {
      route = _routes.find((r) => r.path === '*')
    }

    if (!route) {
      console.error('Ruta no encontrada:', relativePath)
      return
    }

    await updateView(route, relativePath)
  }

  const navigateTo = (path) => {
    let fullPath
    if (path.startsWith('/')) {
      fullPath = path
    } else {
      const separator =
        _basePath.endsWith('/') || _basePath.length === 1 ? '' : '/'
      fullPath = _basePath + separator + path
    }
    window.history.pushState(null, null, fullPath)
    handleRoute()
  }

  const init = () => {
    _rootElement = document.getElementById('app')
    _basePath = getBasePath()

    window.addEventListener('popstate', () => handleRoute())

    document.addEventListener('click', (e) => {
      const link = e.target.closest('[data-link]')
      if (link) {
        e.preventDefault()
        const href = link.getAttribute('href')

        navigateTo(href)
      }
    })

    handleRoute()
  }

  return {
    get routes() {
      return _routes
    },
    set routes(newRoutes) {
      _routes = newRoutes
    },
    getBasePath,
    getRelativePath,
    handleRoute,
    navigateTo,
    init,
  }
}
