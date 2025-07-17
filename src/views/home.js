import { showQuantityModal } from '~/components/modal.js'
import { createElement } from '~/lib/spa.js'
import { createHeartButton } from '~/components/heartButton.js'
import { syncFavorites, isAuthenticated } from '~/lib/state.js'

export function HomeView() {
  return async function () {
    const container = createElement('div', { className: 'products-grid' })

    // Sync favorites if user is authenticated
    if (isAuthenticated()) {
      await syncFavorites()
    }

    try {
      const response = await fetch('/api/assets')
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const products = await response.json()

      if (!Array.isArray(products)) {
        throw new Error('Invalid response format: expected array')
      }

      products.forEach((product) => {
        const imgSrc =
          product.url.startsWith('/') || product.url.startsWith('http')
            ? product.url
            : '/src/' + product.url
        
        const card = createElement(
          'div',
          { className: 'product-card' },
          createElement('div', { className: 'card-header' },
            createElement('img', {
              src: imgSrc,
              alt: product.name,
            }),
            createHeartButton(product.id)
          ),
          createElement('div', { className: 'card-body' },
            createElement('h3', {}, product.name),
            createElement('p', { className: 'price' }, `$${product.price}`),
            createElement(
              'button',
              {
                className: 'add-to-cart',
                onclick: () => showQuantityModal(product),
              },
              'Agregar al carrito'
            )
          )
        )
        container.appendChild(card)
      })
    } catch (error) {
      console.error('Error cargando productos:', error)
      container.appendChild(
        createElement(
          'p',
          { className: 'error-message' },
          'Error al cargar los productos. Por favor, intente más tarde.'
        )
      )
    }

    return container
  }
}
