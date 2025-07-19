import { createElement } from '../lib/spa.js'
import { store } from '../lib/state.js'
import { authService } from '../services/auth.js'

export function createNavbar(router) {
  const header = createElement('header')
  const nav = createElement('nav')
  
  // Logo/Title
  const logoLink = createElement(
    'a',
    { href: '/', 'data-link': true },
    createElement('h1', {}, 'Mi Tienda')
  )
  
  // Navigation links container
  const navLinks = createElement('ul', { id: 'main-nav-links' })
  
  nav.appendChild(logoLink)
  nav.appendChild(navLinks)
  header.appendChild(nav)
  
  // Function to render navigation links
  const renderNavLinks = () => {
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

  // Initial render
  renderNavLinks()

  // Subscribe to auth state changes
  store.subscribe('isAuthenticated', renderNavLinks)

  return header
}