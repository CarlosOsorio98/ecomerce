import { showQuantityModal } from '../components/modal.js'
import { createElement } from '../lib/spa.js'
import { createHeartButton } from '../components/heartButton.js'
import { syncFavorites, isAuthenticated } from '../lib/state.js'
import { viewTransitions } from '../lib/viewTransitions.js'
import { navigateToProduct } from '../lib/navigation.js'

export function HomeView(router) {
  return async function () {
    const container = createElement('div', { className: 'products-grid page-content' })

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

        const navigateToProductPage = () => {
          // Navigate with consistent transition
          if ('startViewTransition' in document) {
            document.startViewTransition(() => {
              router.navigateTo(`/product/${product.id}`)
            })
          } else {
            router.navigateTo(`/product/${product.id}`)
          }
        };
        
        const card = createElement(
          'div',
          { 
            className: 'product-card',
            style: `cursor: pointer;`,
            onclick: navigateToProductPage
          },
          createElement('div', { className: 'card-header' },
            createElement('img', {
              src: imgSrc,
              alt: product.name,
              style: `view-transition-name: product-image-${product.id};`
            }),
            createHeartButton(product.id)
          ),
          createElement('div', { className: 'card-body' },
            createElement('h3', {
              style: `view-transition-name: product-title-${product.id};`
            }, product.name),
            createElement('p', { 
              className: 'price',
              style: `view-transition-name: product-price-${product.id};`
            }, product.hasSizes === false ? 'Sin tallas configuradas' : `$${product.price}`),
            createElement(
              'button',
              {
                className: product.hasSizes === false ? 'add-to-cart disabled' : 'add-to-cart',
                disabled: product.hasSizes === false,
                onclick: (e) => {
                  e.stopPropagation()
                  if (product.hasSizes !== false) {
                    showQuantityModal(product)
                  }
                },
              },
              product.hasSizes === false ? 'Configurar tallas' : 'Agregar al carrito'
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
