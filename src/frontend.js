import { initFloatingCart } from './components/floatingCart.js'
import { createNavbar } from './components/navbar.js'
import { createFooter } from './components/footer.js'
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
  // Don't pre-instantiate components, keep them as factories
  const component = () => {
    if (routeDef.componentFactory === HomeView) {
      return routeDef.componentFactory(basePath)()
    } else {
      return routeDef.componentFactory(router)()
    }
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

    // Create and insert navbar and footer
    const navbar = createNavbar(router)
    const footer = createFooter()
    
    // Insert navbar before main
    const main = document.getElementById('app')
    document.body.insertBefore(navbar, main)
    
    // Insert footer after main
    document.body.appendChild(footer)

    await authService.checkSession()
    router.init()
    initFloatingCart()
  } catch (error) {
    console.error('Error al inicializar la aplicación:', error)
    router.init()
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


if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp)
} else {
  initializeApp()
}
