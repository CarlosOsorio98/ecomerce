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
  // Check if product has sizes configured
  if (!product.sizes || product.sizes.length === 0) {
    alert('Este producto no tiene tallas configuradas y no está disponible para compra.')
    return
  }

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
  let selectedSize = null
  let currentPrice = product.price

  const title = createElement('h2', {}, `Agregar ${product.name}`)

  // Create add button first so it can be referenced in selector
  const addButton = createElement(
    'button',
    {
      className: 'btn-primary',
      disabled: true, // Initially disabled
      onclick: async () => {
        try {
          if (!selectedSize) {
            alert('Por favor selecciona una talla')
            return
          }
          
          if (selectedSize.stock <= 0) {
            alert('Esta talla no tiene stock disponible')
            return
          }
          
          if (quantity > selectedSize.stock) {
            alert(`Solo hay ${selectedSize.stock} unidades disponibles de esta talla`)
            return
          }
          
          await addToCart(product.id, quantity, selectedSize.id)
          document.body.removeChild(modalOverlay)
        } catch (e) {
          console.error('Add to cart error:', e)
          alert('Error al agregar al carrito')
        }
      },
    },
    'Selecciona una talla'
  )

  // Size selection (required for all products)
  const sizeLabel = createElement('p', {}, 'Talla:')
  const sizeSelector = createElement('select', {
    id: 'size-select',
    onchange: (e) => {
      const sizeId = parseInt(e.target.value)
      selectedSize = sizeId ? product.sizes.find(s => s.id === sizeId) : null
      currentPrice = selectedSize ? selectedSize.price : 0
      updateTotalPrice()
      
      // Update quantity input constraints based on stock
      if (selectedSize && selectedSize.stock > 0) {
        quantityInput.max = selectedSize.stock
        if (quantity > selectedSize.stock) {
          quantity = selectedSize.stock
          quantityInput.value = quantity
          updateTotalPrice()
        }
      }
      
      // Update stock display
      if (selectedSize) {
        stockDisplay.textContent = selectedSize.stock > 0 
          ? `Stock disponible: ${selectedSize.stock}` 
          : 'Sin stock disponible'
        stockDisplay.className = selectedSize.stock > 0 ? 'stock-info' : 'stock-info no-stock'
      } else {
        stockDisplay.textContent = ''
      }
      
      // Update add button state
      addButton.disabled = !selectedSize || (selectedSize && selectedSize.stock <= 0)
      addButton.textContent = selectedSize 
        ? (selectedSize.stock > 0 ? 'Agregar' : 'Sin stock')
        : 'Selecciona una talla'
    }
  })

  // Add default option
  const defaultOption = createElement('option', { value: '' }, 'Selecciona una talla')
  sizeSelector.appendChild(defaultOption)

  // Add size options
  product.sizes.forEach(size => {
    const stockText = size.stock > 0 ? ` (Stock: ${size.stock})` : ' (Sin stock)'
    const isOutOfStock = size.stock <= 0
    
    const option = createElement('option', { 
      value: size.id,
      disabled: isOutOfStock
    }, `${size.size} - $${size.price}${stockText}`)
    
    sizeSelector.appendChild(option)
  })

  modalContent.appendChild(sizeLabel)
  modalContent.appendChild(sizeSelector)

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
      
      // Validate against stock if size is selected
      if (selectedSize && selectedSize.stock > 0 && quantity > selectedSize.stock) {
        quantity = selectedSize.stock
        e.target.value = selectedSize.stock
      }
      
      updateTotalPrice()
    },
  })

  const updateTotalPrice = () => {
    const totalPrice = currentPrice * quantity
    priceDisplay.textContent = `Precio Total: $${totalPrice.toFixed(2)}`
  }

  const stockDisplay = createElement('p', { 
    id: 'stock-display',
    className: 'stock-info'
  }, '')
  
  const priceDisplay = createElement(
    'p',
    {},
    `Precio Total: $${(currentPrice * quantity).toFixed(2)}`
  )

  const actions = createElement('div', { className: 'modal-actions' })

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
  modalContent.appendChild(stockDisplay)
  modalContent.appendChild(priceDisplay)
  modalContent.appendChild(actions)

  modalOverlay.appendChild(modalContent)
  document.body.appendChild(modalOverlay)
}
