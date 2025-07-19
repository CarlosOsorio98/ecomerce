import React, { useState } from 'react'
import { useCart } from '../store/index.js'

const FloatingCart = () => {
  const [isCartOpen, setIsCartOpen] = useState(false)
  const { cart, totalItems, addToCart, removeFromCart } = useCart()

  const toggleCartView = () => {
    setIsCartOpen(!isCartOpen)
  }

  const handleAddToCart = async (productId, quantity) => {
    try {
      await addToCart(productId, quantity)
    } catch (error) {
      console.error('Error updating cart:', error)
    }
  }

  const handleRemoveFromCart = (itemId) => {
    removeFromCart(itemId)
  }

  const renderCartItems = () => {
    if (!cart || cart.length === 0) {
      return <p>El carrito está vacío.</p>
    }

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

    return (
      <>
        {cart.map((item) => {
          const imgSrc = item.url.startsWith('/') || item.url.startsWith('http') 
            ? item.url 
            : `/${item.url}`

          return (
            <div key={item.id} className="cart-item">
              <img 
                src={imgSrc} 
                alt={item.name} 
                className="cart-item-image" 
              />
              <div className="cart-item-details">
                <h4>{item.name}</h4>
                <p>${item.price.toFixed(2)} c/u</p>
                <div className="cart-item-quantity-control">
                  <button onClick={() => handleAddToCart(item.product_id, -1)}>
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button onClick={() => handleAddToCart(item.product_id, 1)}>
                    +
                  </button>
                </div>
              </div>
              <button 
                className="remove-item-button"
                onClick={() => handleRemoveFromCart(item.id)}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 12L14 16M14 12L10 16M4 6H20M16 6L15.7294 5.18807C15.4671 4.40125 15.3359 4.00784 15.0927 3.71698C14.8779 3.46013 14.6021 3.26132 14.2905 3.13878C13.9376 3 13.523 3 12.6936 3H11.3064C10.477 3 10.0624 3 9.70951 3.13878C9.39792 3.26132 9.12208 3.46013 8.90729 3.71698C8.66405 4.00784 8.53292 4.40125 8.27064 5.18807L8 6M18 6V16.2C18 17.8802 18 18.7202 17.673 19.362C17.3854 19.9265 16.9265 20.3854 16.362 20.673C15.7202 21 14.8802 21 13.2 21H10.8C9.11984 21 8.27976 21 7.63803 20.673C7.07354 20.3854 6.6146 19.9265 6.32698 19.362C6 18.7202 6 17.8802 6 16.2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          )
        })}
        <div className="cart-total">
          <h3>Total:</h3>
          <span>${total.toFixed(2)}</span>
        </div>
      </>
    )
  }

  return (
    <>
      <button 
        id="floating-cart-button"
        className="floating-cart-button"
        onClick={toggleCartView}
      >
        <span className="cart-icon"></span>
        <span 
          id="cart-count" 
          className={`cart-count ${totalItems > 0 ? 'updated' : ''}`}
        >
          {totalItems}
        </span>
      </button>

      {isCartOpen && (
        <div 
          className="cart-overlay open"
          onClick={(e) => {
            if (e.target.classList.contains('cart-overlay')) {
              toggleCartView()
            }
          }}
        >
          <div className="cart-content">
            <div className="cart-header">
              <button 
                className="close-cart-button"
                onClick={toggleCartView}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <h2>Tu Carrito</h2>
            </div>
            <div className="cart-items">
              {renderCartItems()}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default FloatingCart