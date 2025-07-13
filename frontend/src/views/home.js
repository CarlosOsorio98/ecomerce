import { showQuantityModal } from '../components/modal.js'
import { createElement } from '../spa.js'

export function HomeView() {
  return async function () {
    const container = createElement('div', { className: 'products-grid' })

    try {
      const response = await fetch('/api/assets')
      const products = await response.json()

      products.forEach((product) => {
        const imgSrc =
          product.url.startsWith('/') || product.url.startsWith('http')
            ? product.url
            : '/frontend/' + product.url
        const card = createElement(
          'div',
          { className: 'product-card' },
          createElement('img', {
            src: imgSrc,
            alt: product.name,
          }),
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
