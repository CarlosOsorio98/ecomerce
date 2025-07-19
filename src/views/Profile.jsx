import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth, useCart, useFavorites } from '../store/index.js'

const Profile = () => {
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { cart, syncCart } = useCart()
  const { favorites, syncFavorites } = useFavorites()
  const navigate = useNavigate()

  useEffect(() => {
    const initProfile = async () => {
      try {
        await syncCart()
        await syncFavorites()
        
        // Force a second sync to ensure UI consistency
        await new Promise((resolve) => setTimeout(resolve, 100))
        await syncFavorites()
      } catch (error) {
        console.error('Error loading profile:', error)
      } finally {
        setLoading(false)
      }
    }

    initProfile()
  }, [])

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`)
  }

  if (loading) {
    return <div>Cargando perfil...</div>
  }

  if (!user) {
    return <div>Error: Usuario no encontrado</div>
  }

  return (
    <div className="profile-container">
      {/* Favorites Section */}
      <section className="favorites-section">
        <h2>Mis Favoritos</h2>
        {favorites && favorites.length > 0 ? (
          <div className="favorites-grid">
            {favorites.map((product) => {
              let imgSrc = product.assets && product.assets.length > 0 
                ? (product.assets[0].url || product.assets[0].url_local || '/placeholder.jpg')
                : '/placeholder.jpg'
              
              if (imgSrc && !imgSrc.startsWith('/') && !imgSrc.startsWith('http')) {
                imgSrc = '/' + imgSrc
              }

              return (
                <div 
                  key={product.id}
                  className="favorite-item"
                  onClick={() => handleProductClick(product.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <img src={imgSrc} alt={product.name} />
                  <h4>{product.name}</h4>
                  <p className="price">${product.price}</p>
                </div>
              )
            })}
          </div>
        ) : (
          <p>No tienes productos favoritos aún.</p>
        )}
      </section>

      {/* Cart Section */}
      <section className="cart-section">
        <h2>Mi Carrito</h2>
        {cart && cart.length > 0 ? (
          <div className="cart-items">
            {cart.map((item) => {
              let imgSrc = item.url
              if (imgSrc && !imgSrc.startsWith('/') && !imgSrc.startsWith('http')) {
                imgSrc = '/' + imgSrc
              }

              return (
                <div key={item.id} className="cart-item">
                  <img src={imgSrc} alt={item.name} />
                  <div className="cart-item-details">
                    <h4>{item.name}</h4>
                    <p>${item.price.toFixed(2)} c/u</p>
                    <p>Cantidad: {item.quantity}</p>
                    <p>Subtotal: ${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              )
            })}
            <div className="cart-total">
              <h3>
                Total: ${cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}
              </h3>
            </div>
          </div>
        ) : (
          <p>Tu carrito está vacío.</p>
        )}
      </section>

      {/* Account Section */}
      <section className="account-section">
        <h2>Mi Cuenta</h2>
        <div className="user-info">
          <p><strong>Nombre:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
        </div>
      </section>
    </div>
  )
}

export default Profile