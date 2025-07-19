import { showQuantityModal } from '../components/modal.js'
import { createElement } from '../lib/spa.js'
import { createHeartButton } from '../components/heartButton.js'
import { syncFavorites, isAuthenticated } from '../lib/state.js'

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
          // The key is to give the image and title a unique transition name
          // based on the product ID. This allows the browser to connect this
          // element with the corresponding one on the next page.
          const img = card.querySelector('img');
          const title = card.querySelector('h3');
          if (img) img.style.viewTransitionName = `product-image-${product.id}`;
          if (title) title.style.viewTransitionName = `product-title-${product.id}`;

          // Use the router to navigate. The spa.js router already handles
          // wrapping this in a document.startViewTransition.
          window.history.pushState(null, null, `/product/${product.id}`);
          window.dispatchEvent(new Event('popstate'));
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
