import { createElement } from '../lib/spa.js'
import { addToCart, isAuthenticated } from '../lib/state.js'

const plusAndMinus = (quantityInput) => {
  return createElement('div', { className: 'plus-and-minus' }, [
    createElement(
      'button',
      {
        className: 'minus-button',
        onclick: () => {
          const input = document.getElementById('quantity-input')
          const currentValue = parseInt(input.value, 10)
          if (currentValue > 1) {
            input.value = currentValue - 1
            input.dispatchEvent(new Event('input', { bubbles: true }))
          }
        },
      },
      '-'
    ),
    quantityInput,
    createElement(
      'button',
      {
        className: 'plus-button',
        onclick: () => {
          const input = document.getElementById('quantity-input')
          const currentValue = parseInt(input.value, 10)
          input.value = currentValue + 1
          input.dispatchEvent(new Event('input', { bubbles: true }))
        },
      },
      '+'
    ),
  ])
}

export function showQuantityModal(product) {
  const modalOverlay = createElement('div', { className: 'modal-overlay' })
  const modalContent = createElement('div', { className: 'modal-content' })

  // Check if user is authenticated
  if (!isAuthenticated()) {
    const title = createElement('h2', {}, 'Iniciar Sesión Requerido')
    const message = createElement('p', {}, 'Para agregar productos al carrito necesitas iniciar sesión.')
    
    const actions = createElement('div', { className: 'modal-actions' })
    const loginButton = createElement(
      'button',
      {
        className: 'btn-primary',
        onclick: () => {
          document.body.removeChild(modalOverlay)
          window.history.pushState(null, null, '/login')
          window.dispatchEvent(new Event('popstate'))
        },
      },
      'Iniciar Sesión'
    )

    const cancelButton = createElement(
      'button',
      {
        className: 'btn-secondary',
        onclick: () => document.body.removeChild(modalOverlay),
      },
      'Cancelar'
    )

    actions.appendChild(loginButton)
    actions.appendChild(cancelButton)

    modalContent.appendChild(title)
    modalContent.appendChild(message)
    modalContent.appendChild(actions)

    modalOverlay.appendChild(modalContent)
    document.body.appendChild(modalOverlay)
    return
  }

  // Normal quantity modal for authenticated users
  let quantity = 1
  let totalPrice = product.price

  const title = createElement('h2', {}, `Agregar ${product.name}`)
  const quantityLabel = createElement('p', {}, 'Cantidad:')
  const quantityInput = createElement('input', {
    id: 'quantity-input',
    type: 'number',
    value: quantity,
    min: 1,
    oninput: (e) => {
      quantity = parseInt(e.target.value, 10)
      if (isNaN(quantity) || quantity < 1) {
        quantity = 1
        e.target.value = 1
      }
      totalPrice = product.price * quantity
      priceDisplay.textContent = `Precio Total: $${totalPrice.toFixed(2)}`
    },
  })
  const priceDisplay = createElement(
    'p',
    {},
    `Precio Total: $${totalPrice.toFixed(2)}`
  )

  const actions = createElement('div', { className: 'modal-actions' })
  const addButton = createElement(
    'button',
    {
      className: 'btn-primary',
      onclick: async () => {
        try {
          await addToCart(product.id, quantity)
          document.body.removeChild(modalOverlay)
        } catch (e) {
          console.error('Add to cart error:', e)
          alert('Error al agregar al carrito')
        }
      },
    },
    'Agregar'
  )

  const cancelButton = createElement(
    'button',
    {
      className: 'btn-secondary',
      onclick: () => document.body.removeChild(modalOverlay),
    },
    'Cancelar'
  )

  actions.appendChild(addButton)
  actions.appendChild(cancelButton)

  modalContent.appendChild(title)
  modalContent.appendChild(quantityLabel)
  modalContent.appendChild(plusAndMinus(quantityInput))
  modalContent.appendChild(priceDisplay)
  modalContent.appendChild(actions)

  modalOverlay.appendChild(modalContent)
  document.body.appendChild(modalOverlay)
}
