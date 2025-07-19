import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth, useCart, useFavorites } from '../store/index.js'

// Simple HeartButton component
const HeartButton = ({ productId }) => {
  const { toggleFavorite, isFavorite } = useFavorites()
  const [isProductFavorite, setIsProductFavorite] = useState(isFavorite(productId))

  const handleToggleFavorite = async (e) => {
    e.stopPropagation()
    try {
      await toggleFavorite(productId)
      setIsProductFavorite(isFavorite(productId))
    } catch (error) {
      console.error('Error toggling favorite:', error)
    }
  }

  return (
    <button
      className="heart-button"
      onClick={handleToggleFavorite}
      aria-label={
        isProductFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'
      }
    >
      <svg width="24" height="24" viewBox="0 0 24 24" className="heart-svg">
        <path
          d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
          stroke={isProductFavorite ? '#e74c3c' : '#666'}
          strokeWidth="2"
          fill={isProductFavorite ? '#e74c3c' : 'none'}
          className="heart-path"
        />
      </svg>
    </button>
  )
}

// Simple QuantityModal component
const QuantityModal = ({ product, isOpen, onClose, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1)

  if (!isOpen) return null

  const handleAddToCart = () => {
    onAddToCart(product, quantity)
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Agregar al carrito</h2>
        <p>{product.name}</p>
        <div className="plus-and-minus">
          <button
            className="minus-button"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
          >
            -
          </button>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)}
            min="1"
          />
          <button
            className="plus-button"
            onClick={() => setQuantity(quantity + 1)}
          >
            +
          </button>
        </div>
        <div className="modal-actions">
          <button onClick={onClose}>Cancelar</button>
          <button onClick={handleAddToCart}>Agregar al carrito</button>
        </div>
      </div>
    </div>
  )
}

const Home = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [modalProduct, setModalProduct] = useState(null)
  const { isAuthenticated } = useAuth()
  const { addToCart } = useCart()
  const { syncFavorites } = useFavorites()
  const navigate = useNavigate()

  // Fetch products on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Sync favorites if user is authenticated
        if (isAuthenticated) {
          await syncFavorites()
        }

        const response = await fetch('/api/products')

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const productsData = await response.json()

        if (!Array.isArray(productsData)) {
          throw new Error('Invalid response format: expected array')
        }

        setProducts(productsData)
      } catch (err) {
        console.error('Error cargando productos:', err)
        setError('Error al cargar los productos. Por favor, intente más tarde.')
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [isAuthenticated])

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`)
  }

  const handleShowQuantityModal = (e, product) => {
    e.stopPropagation()
    setModalProduct(product)
  }

  const handleAddToCart = async (product, quantity) => {
    try {
      await addToCart(product.id, quantity)
      setModalProduct(null)
    } catch (error) {
      console.error('Error adding to cart:', error)
    }
  }

  if (loading) {
    return <div>Cargando productos...</div>
  }

  if (error) {
    return <div className="error-message">{error}</div>
  }

  return (
    <>
      <div className="products-grid">
        {products.map((product) => {
          // Get the first asset's image or placeholder
          let imgSrc =
            product.assets && product.assets.length > 0
              ? product.assets[0].url ||
                product.assets[0].url_local ||
                '/placeholder.jpg'
              : '/placeholder.jpg'

          // Ensure URL starts with / for absolute path
          if (imgSrc && !imgSrc.startsWith('/') && !imgSrc.startsWith('http')) {
            imgSrc = '/' + imgSrc
          }

          return (
            <div
              key={product.id}
              className="product-card"
              style={{ cursor: 'pointer' }}
              onClick={() => handleProductClick(product.id)}
            >
              <div className="card-header">
                <img src={imgSrc} alt={product.name} />
                <HeartButton productId={product.id} />
              </div>
              <div className="card-body">
                <h3>{product.name}</h3>
                <p className="price">${product.price}</p>
                <button
                  className="add-to-cart"
                  onClick={(e) => handleShowQuantityModal(e, product)}
                >
                  Agregar al carrito
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <QuantityModal
        product={modalProduct}
        isOpen={!!modalProduct}
        onClose={() => setModalProduct(null)}
        onAddToCart={handleAddToCart}
      />
    </>
  )
}

export default Home
