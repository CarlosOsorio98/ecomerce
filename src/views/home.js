import { showQuantityModal } from '../components/modal.js'
import { createElement } from '../lib/spa.js'
import { createHeartButton } from '../components/heartButton.js'
import { syncFavorites, isAuthenticated } from '../lib/state.js'
import { viewTransitions } from '../lib/viewTransitions.js'

export function HomeView() {
  return async function () {
    const container = createElement('div', { className: 'products-grid' })

    // Sync favorites if user is authenticated
    if (isAuthenticated()) {
      await syncFavorites()
    }

    try {
      const response = await fetch('/api/products')
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const products = await response.json()

      if (!Array.isArray(products)) {
        throw new Error('Invalid response format: expected array')
      }

      products.forEach((product) => {
        // Get the first asset's image or placeholder
        let imgSrc = product.assets && product.assets.length > 0 
          ? (product.assets[0].url || product.assets[0].url_local || '/placeholder.jpg')
          : '/placeholder.jpg'
        
        // Ensure URL starts with / for absolute path
        if (imgSrc && !imgSrc.startsWith('/') && !imgSrc.startsWith('http')) {
          imgSrc = '/' + imgSrc
        }

        const navigateToProduct = () => {
          // Set transition names for smooth navigation
          viewTransitions.setProductTransition(card, product.id)
          
          // Navigate to product page with transition
          viewTransitions.navigateWithTransition(`/product/${product.id}`, () => {
            window.history.pushState(null, null, `/product/${product.id}`);
            window.dispatchEvent(new Event('popstate'));
          })
        };
        
        const card = createElement(
          'div',
          { 
            className: 'product-card',
            style: `cursor: pointer;`,
            onclick: navigateToProduct
          },
          createElement('div', { className: 'card-header' },
            createElement('img', {
              src: imgSrc,
              alt: product.name
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
                onclick: (e) => {
                  e.stopPropagation()
                  showQuantityModal(product)
                },
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
