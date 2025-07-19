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

    // Use smooth transition for navbar updates
    const updateNavContent = () => {
      const homeLink = createElement(
        'li',
        {},
        createElement('a', { href: '/', 'data-link': true }, 'Inicio')
      )
      
      const newElements = [homeLink]

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
        newElements.push(profileLink, logoutButtonLi)
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
        newElements.push(loginLink, registerLink)
      }

      return newElements
    }

    // Smooth update with fade effect
    if ('startViewTransition' in document) {
      document.startViewTransition(() => {
        navLinks.innerHTML = ''
        updateNavContent().forEach(el => navLinks.appendChild(el))
      })
    } else {
      navLinks.style.opacity = '0'
      navLinks.style.transition = 'opacity 0.15s ease'
      
      setTimeout(() => {
        navLinks.innerHTML = ''
        updateNavContent().forEach(el => navLinks.appendChild(el))
        navLinks.style.opacity = '1'
      }, 150)
    }
  }

  // Initial render
  renderNavLinks()

  // Subscribe to auth state changes
  store.subscribe('isAuthenticated', renderNavLinks)

  return header
}