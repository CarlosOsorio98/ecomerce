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

const supportsViewTransitions = 'startViewTransition' in document

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
      const view = await route.component()
      if (_rootElement) {
        _rootElement.innerHTML = ''
        _rootElement.appendChild(view)
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
    const route =
      _routes.find((r) => r.path === relativePath) ||
      _routes.find((r) => r.path === '*')

    if (!route) {
      console.error('Ruta no encontrada:', relativePath)
      return
    }

    if (supportsViewTransitions) {
      document.startViewTransition(() => {
        updateView(route, relativePath)
      })
    } else {
      await updateView(route, relativePath)
    }
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
