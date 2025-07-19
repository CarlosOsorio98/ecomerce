import { createElement } from '../lib/spa.js'
import { cartService } from '../services/cart.js'
import { showQuantityModal } from '../components/modal.js'
import { viewTransitions } from '../lib/viewTransitions.js'

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

      const container = createElement('div', { className: 'product-container' })

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
          });
          
          // Set transition name for smooth navigation from home
          viewTransitions.setTransitionName(img, `product-image-${product.id}`)
          
          imageContainer.appendChild(img);
        });
      } else {
        const placeholder = createElement(
          'div',
          { className: 'product-placeholder' },
          'No image available'
        );
        imageContainer.appendChild(placeholder);
      }

      // Product info
      const infoContainer = createElement('div', { className: 'product-info' });

      const title = createElement(
        'h1',
        {
          className: 'product-title',
        },
        product.name
      );
      
      // Set transition name for smooth navigation from home and favorites
      viewTransitions.setTransitionName(title, `product-title-${product.id}`)
      const price = createElement(
        'p',
        { className: 'product-price' },
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
            e.preventDefault();
            showQuantityModal(product);
          },
        },
        'Add to Cart'
      );

      // Back button
      const backButton = createElement(
        'button',
        {
          className: 'back-btn',
          onclick: (e) => {
            e.preventDefault()
            router.navigateTo('/')
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
