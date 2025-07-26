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
        product.sizes && product.sizes.length > 0 
          ? `Desde $${Math.min(...product.sizes.map(s => s.price))} (precio promedio: $${product.price})`
          : 'Sin tallas configuradas - No disponible para compra'
      )
      
      // Display available sizes
      let sizesDisplay = null
      if (product.sizes && product.sizes.length > 0) {
        const sizesTitle = createElement('h3', { className: 'sizes-title' }, 'Tallas disponibles:')
        const sizesList = createElement('div', { className: 'sizes-list' })
        
        product.sizes.forEach(size => {
          const stockText = size.stock > 0 ? `Stock: ${size.stock}` : 'Sin stock'
          const stockClass = size.stock > 0 ? 'size-stock' : 'size-stock no-stock'
          
          const sizeItem = createElement('div', { 
            className: size.stock > 0 ? 'size-item' : 'size-item out-of-stock' 
          }, [
            createElement('span', { className: 'size-name' }, size.size),
            createElement('span', { className: 'size-price' }, `$${size.price}`),
            createElement('span', { className: stockClass }, stockText)
          ])
          sizesList.appendChild(sizeItem)
        })
        
        sizesDisplay = createElement('div', { className: 'sizes-section' }, [sizesTitle, sizesList])
      }
      
      const description = createElement(
        'p',
        { className: 'product-description' },
        product.description || 'No description available'
      )

      // Add to cart button
      const addToCartButton = createElement(
        'button',
        {
          className: product.sizes && product.sizes.length > 0 ? 'add-to-cart-btn' : 'add-to-cart-btn disabled',
          disabled: !product.sizes || product.sizes.length === 0,
          onclick: (e) => {
            e.preventDefault()
            if (product.sizes && product.sizes.length > 0) {
              showQuantityModal(product)
            }
          },
        },
        product.sizes && product.sizes.length > 0 ? 'Agregar al carrito' : 'Sin tallas disponibles'
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
      if (sizesDisplay) {
        infoContainer.appendChild(sizesDisplay)
      }
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
