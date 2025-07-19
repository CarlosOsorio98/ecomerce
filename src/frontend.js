import { initFloatingCart } from './components/floatingCart.js'
import { authService } from './services/auth.js'
import { createElement, createRouter } from './lib/spa.js'
import { store } from './lib/state.js'
import { HomeView } from './views/home.js'
import { LoginView } from './views/login.js'
import { ProfileView } from './views/profile.js'
import { RegisterView } from './views/register.js'
import { ProductView } from './views/product.js'

const basePath = (() => {
  const script = document.querySelector('script[src*="frontend.js"]')
  if (script) {
    return script.getAttribute('src').replace('frontend.js', '')
  }
  return './'
})()

function renderNavbar() {
  const navLinks = document.getElementById('main-nav-links')
  const isAuthenticated = store.getState().isAuthenticated
  const user = store.getState().user

  navLinks.innerHTML = ''

  const homeLink = createElement(
    'li',
    {},
    createElement('a', { href: '/', 'data-link': true }, 'Inicio')
  )
  navLinks.appendChild(homeLink)

  if (isAuthenticated && user) {
    const profileLink = createElement(
      'li',
      {},
      createElement('a', { href: '/profile', 'data-link': true }, user.name)
    )
    const logoutButtonLi = createElement('li', {})
    const logoutButton = createElement(
      'button',
      {
        className: 'logout-button',
        onclick: async (e) => {
          e.preventDefault()
          await authService.signOut()
          router.navigateTo('/')
        },
      },
      'Cerrar sesión'
    )

    logoutButtonLi.appendChild(logoutButton)
    navLinks.appendChild(profileLink)
    navLinks.appendChild(logoutButtonLi)
  } else {
    const loginLink = createElement(
      'li',
      {},
      createElement(
        'a',
        { href: '/login', 'data-link': true },
        'Iniciar Sesión'
      )
    )
    const registerLink = createElement(
      'li',
      {},
      createElement('a', { href: '/register', 'data-link': true }, 'Registro')
    )
    navLinks.appendChild(loginLink)
    navLinks.appendChild(registerLink)
  }
}

const routeDefinitions = [
  { path: '/', componentFactory: HomeView },
  { path: '/login', componentFactory: LoginView },
  { path: '/register', componentFactory: RegisterView },
  { path: '/profile', componentFactory: ProfileView },
  { path: '/product/:id', componentFactory: ProductView },
  { path: '*', componentFactory: HomeView },
]

const router = createRouter([])

const routes = routeDefinitions.map((routeDef) => {
  let component
  if (routeDef.componentFactory === HomeView) {
    component = routeDef.componentFactory(basePath)
  } else {
    component = routeDef.componentFactory(router)
  }
  return { path: routeDef.path, component }
})

router.routes = routes

async function initializeApp() {
  const loadingIndicator = document.getElementById('loading-indicator')
  const startTime = Date.now()

  try {
    if (loadingIndicator) {
      loadingIndicator.style.display = 'flex'
    }

    await authService.checkSession()
    router.init()
    renderNavbar()
    initFloatingCart()
  } catch (error) {
    console.error('Error al inicializar la aplicación:', error)
    router.init()
    renderNavbar()
  } finally {
    if (loadingIndicator) {
      // Ensure loader is visible for at least 300ms
      const elapsed = Date.now() - startTime
      const minDisplayTime = 300
      const remainingTime = Math.max(0, minDisplayTime - elapsed)
      
      setTimeout(() => {
        loadingIndicator.style.display = 'none'
      }, remainingTime)
    }
  }
}

store.subscribe('isAuthenticated', renderNavbar)

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp)
} else {
  initializeApp()
}
