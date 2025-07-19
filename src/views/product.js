import { showQuantityModal } from '../components/modal.js'
import { createElement } from '../lib/spa.js'

export const ProductView = (router) => {
  return async () => {
    const productId = window.location.pathname.split('/product/')[1]

    if (!productId) {
      return createElement('div', { className: 'error' }, 'Product not found')
    }

    try {
      const response = await fetch(`/api/products/${productId}`)

      if (!response.ok) {
        throw new Error('Product not found')
      }

      const product = await response.json()

      const container = createElement('div', {
        className: 'product-container page-content',
      })

      const productCard = createElement('div', { className: 'product-card' })

      // Product images
      const imageContainer = createElement('div', {
        className: 'product-images',
      })

      if (product.assets && product.assets.length > 0) {
        product.assets.forEach((asset) => {
          let imgSrc = asset.url || asset.url_local || '/placeholder.jpg'
          // Ensure URL starts with / for absolute path
          if (imgSrc && !imgSrc.startsWith('/') && !imgSrc.startsWith('http')) {
            imgSrc = '/' + imgSrc
          }
          const img = createElement('img', {
            src: imgSrc,
            alt: product.name,
            className: 'product-image',
            style: `view-transition-name: product-image-${product.id};`,
          })

          imageContainer.appendChild(img)
        })
      } else {
        const placeholder = createElement(
          'div',
          { className: 'product-placeholder' },
          'No image available'
        )
        imageContainer.appendChild(placeholder)
      }

      // Product info
      const infoContainer = createElement('div', { className: 'product-info' })

      const title = createElement(
        'h1',
        {
          className: 'product-title',
          style: `view-transition-name: product-title-${product.id};`,
        },
        product.name
      )
      const price = createElement(
        'p',
        {
          className: 'product-price',
          style: `view-transition-name: product-price-${product.id};`,
        },
        `$${product.price}`
      )
      const description = createElement(
        'p',
        { className: 'product-description' },
        product.description || 'No description available'
      )

      // Add to cart button
      const addToCartButton = createElement(
        'button',
        {
          className: 'add-to-cart-btn',
          onclick: (e) => {
            e.preventDefault()
            showQuantityModal(product)
          },
        },
        'Add to Cart'
      )

      // Back button
      const backButton = createElement(
        'button',
        {
          className: 'back-btn',
          onclick: (e) => {
            e.preventDefault()
            // Navigate back with transition
            if ('startViewTransition' in document) {
              document.startViewTransition(() => {
                router.navigateTo('/')
              })
            } else {
              router.navigateTo('/')
            }
          },
        },
        '← Back to Products'
      )

      infoContainer.appendChild(title)
      infoContainer.appendChild(price)
      infoContainer.appendChild(description)
      infoContainer.appendChild(addToCartButton)
      infoContainer.appendChild(backButton)

      productCard.appendChild(imageContainer)
      productCard.appendChild(infoContainer)

      container.appendChild(productCard)

      return container
    } catch (error) {
      console.error('Error loading product:', error)
      return createElement(
        'div',
        { className: 'error' },
        'Error loading product'
      )
    }
  }
}
