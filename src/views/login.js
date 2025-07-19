import { authService } from '../services/auth.js'
import { createElement } from '../lib/spa.js'

export function LoginView(router) {
  return function () {
    return createElement(
      'div',
      { className: 'auth-container' },
      createElement(
        'form',
        {
          className: 'auth-form',
          onsubmit: async (e) => {
            e.preventDefault()
            const email = e.target.email.value
            const password = e.target.password.value

            try {
              await authService.signIn(email, password)
              router.navigateTo('/')
            } catch (error) {
              console.error('Login error:', error)
              let msg = 'Error al iniciar sesión'
              
              if (error instanceof Error) {
                msg = error.message
              } else if (error && typeof error === 'object') {
                if (error.error) msg = error.error
                else if (error.message) msg = error.message
                else msg = 'Error desconocido al iniciar sesión'
              } else if (typeof error === 'string') {
                msg = error
              }
              
              alert(msg)
            }
          },
        },
        createElement('h2', {}, 'Iniciar Sesión'),
        createElement('input', {
          type: 'email',
          name: 'email',
          placeholder: 'Correo electrónico',
          required: true,
        }),
        createElement('input', {
          type: 'password',
          name: 'password',
          placeholder: 'Contraseña',
          required: true,
        }),
        createElement('button', { type: 'submit' }, 'Ingresar'),
        createElement('div', { className: 'auth-footer' },
          createElement('p', {}, '¿No tienes cuenta? '),
          createElement('a', {
            href: '/register',
            'data-link': true,
            onclick: (e) => {
              e.preventDefault()
              router.navigateTo('/register')
            }
          }, 'Regístrate')
        )
      )
    )
  }
}
