import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useCart } from '../store/index.js'

const Product = () => {
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [quantity, setQuantity] = useState(1)
  
  const { id: productId } = useParams()
  const { addToCart } = useCart()

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) {
        setError('Product not found')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/products/${productId}`)

        if (!response.ok) {
          throw new Error('Product not found')
        }

        const productData = await response.json()
        setProduct(productData)
      } catch (err) {
        console.error('Error loading product:', err)
        setError('Error loading product')
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [productId])

  const handleAddToCart = async () => {
    try {
      await addToCart(product.id, quantity)
      console.log('Added to cart:', product, quantity)
    } catch (cartError) {
      console.error('Error adding to cart:', cartError)
    }
  }

  if (loading) {
    return <div>Cargando producto...</div>
  }

  if (error) {
    return <div className="error">{error}</div>
  }

  if (!product) {
    return <div className="error">Producto no encontrado</div>
  }

  return (
    <div className="product-container">
      <div className="product-card">
        <div className="product-images">
          {product.assets && product.assets.length > 0 ? (
            product.assets.map((asset, index) => {
              let imgSrc = asset.url || asset.url_local || '/placeholder.jpg'

              if (
                imgSrc &&
                !imgSrc.startsWith('/') &&
                !imgSrc.startsWith('http')
              ) {
                imgSrc = '/' + imgSrc
              }

              return (
                <img
                  key={index}
                  src={imgSrc}
                  alt={product.name}
                  className="product-image"
                />
              )
            })
          ) : (
            <img
              src="/placeholder.jpg"
              alt={product.name}
              className="product-image"
            />
          )}
        </div>

        <div className="product-info">
          <h1>{product.name}</h1>
          <p className="product-description">{product.description}</p>
          <p className="product-price">${product.price}</p>

          <div className="product-actions">
            <div className="quantity-control">
              <label htmlFor="quantity">Cantidad:</label>
              <div className="quantity-input">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <input
                  id="quantity"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)}
                  min="1"
                />
                <button onClick={() => setQuantity(quantity + 1)}>
                  +
                </button>
              </div>
            </div>

            <button className="add-to-cart-button" onClick={handleAddToCart}>
              Agregar al carrito
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Product