import { authService } from '~/services/auth.js'
import { createElement } from '~/lib/spa.js'

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
              alert(error.message)
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
        createElement('button', { type: 'submit' }, 'Ingresar')
      )
    )
  }
}
