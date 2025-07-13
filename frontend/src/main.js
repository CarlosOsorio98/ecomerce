import { initFloatingCart } from './components/floatingCart.js'
import { authService } from './services/auth.js'
import { createElement, createRouter } from './spa.js'
import { store } from './state.js'
import { HomeView } from './views/home.js'
import { LoginView } from './views/login.js'
import { ProfileView } from './views/profile.js'
import { RegisterView } from './views/register.js'

const basePath = document
  .querySelector('script[src*="main.js"]')
  .getAttribute('src')
  .replace('src/main.js', '')

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

  try {
    if (loadingIndicator) {
      loadingIndicator.style.display = 'block'
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
      loadingIndicator.style.display = 'none'
    }
  }
}

store.subscribe('isAuthenticated', renderNavbar)

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp)
} else {
  initializeApp()
}
