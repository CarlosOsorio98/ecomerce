import { userService } from '../services/user.js'
import { createElement } from '../lib/spa.js'
import { createHeartButton } from '../components/heartButton.js'
import {
  addToCart,
  getCart,
  getUser,
  removeFromCart,
  syncCart,
  syncFavorites,
  getFavorites,
  store,
} from '../lib/state.js'

export function ProfileView(router) {
  return async function () {
    const user = getUser()
    await syncCart()
    await syncFavorites()
    // Force a second sync to ensure UI consistency
    await new Promise(resolve => setTimeout(resolve, 100))
    await syncFavorites()
    const cart = getCart()
    const favorites = getFavorites()

    const container = createElement('div', { className: 'profile-container' })
    
    let favoritesSection = createFavoritesSection(favorites, router)
    container.appendChild(favoritesSection)
    
    let cartSection = await createCartSection(cart, user, router)
    container.appendChild(cartSection)
    
    const accountSection = createAccountSection(user, router)
    container.appendChild(accountSection)
    
    // Add reactive updates for cart changes
    const unsubscribeCart = store.subscribe('cart', async (newCart) => {
      const newCartSection = await createCartSection(newCart, user, router)
      container.replaceChild(newCartSection, cartSection)
      cartSection = newCartSection
    })
    
    // Add reactive updates for favorites changes  
    const unsubscribeFavorites = store.subscribe('favorites', (newFavorites) => {
      const newFavoritesSection = createFavoritesSection(newFavorites, router)
      container.replaceChild(newFavoritesSection, favoritesSection)
      favoritesSection = newFavoritesSection
    })
    
    // Cleanup function (not used in this app but good practice)
    container._cleanup = () => {
      unsubscribeCart()
      unsubscribeFavorites()
    }
    
    return container
  }
}

async function createCartSection(cart, user, router) {
  const cartSection = createElement(
    'div',
    { className: 'cart-section' },
    createElement('h2', {}, `Bienvenido, ${user.name}`),
    createElement('h3', {}, 'Tu Carrito de Compras')
  )

  if (!cart || cart.length === 0) {
    cartSection.appendChild(createElement('p', {}, 'Tu carrito está vacío.'))
  } else {
    let total = 0
    const cartList = createElement('ul', { className: 'cart-list' })
    for (const item of cart) {
      const subtotal = item.price * item.quantity
      total += subtotal
      const quantityControls = createElement(
        'div',
        { className: 'quantity-controls' },
        createElement(
          'button',
          {
            onclick: () => {
              addToCart(item.asset_id, -1)
            },
          },
          '-'
        ),
        createElement('span', {}, item.quantity),
        createElement(
          'button',
          {
            onclick: () => {
              addToCart(item.asset_id, 1)
            },
          },
          '+'
        )
      )
      const itemDetails = createElement(
        'div',
        { className: 'item-details' },
        `${item.name} ($${item.price.toFixed(2)} c/u)`
      )
      const itemSubtotal = createElement(
        'div',
        { className: 'item-subtotal' },
        `Subtotal: $${subtotal.toFixed(2)}`
      )
      const removeButton = createElement(
        'button',
        {
          className: 'remove-item',
          onclick: () => {
            removeFromCart(item.id)
          },
        },
        '×'
      )
      const cartItem = createElement(
        'li',
        { className: 'cart-item' },
        itemDetails,
        quantityControls,
        itemSubtotal,
        removeButton
      )
      cartList.appendChild(cartItem)
    }
    const totalElement = createElement(
      'p',
      { className: 'cart-total' },
      `Total: $${total.toFixed(2)}`
    )
    cartSection.appendChild(cartList)
    cartSection.appendChild(totalElement)
  }
  return cartSection
}

function createAccountSection(user, router) {
  const accountSection = createElement('div', {
    className: 'account-section auth-form',
  })

  const changePasswordForm = createElement('form', {
    className: 'change-password-form',
    onsubmit: async (e) => {
      e.preventDefault()
      const currentPassword = e.target.currentPassword.value
      const newPassword = e.target.newPassword.value
      const confirmPassword = e.target.confirmPassword.value

      if (newPassword !== confirmPassword) {
        alert('La nueva contraseña y la confirmación no coinciden.')
        return
      }
      if (!newPassword || !currentPassword) {
        alert('Por favor, completa todos los campos.')
        return
      }

      try {
        await userService.changePassword(user.id, currentPassword, newPassword)
        alert('¡Contraseña actualizada exitosamente!')
        e.target.reset()
      } catch (error) {
        alert(`Error: ${error.message}`)
      }
    },
  })

  changePasswordForm.append(
    createElement('h3', {}, 'Cambiar Contraseña'),
    createElement('input', {
      type: 'password',
      name: 'currentPassword',
      placeholder: 'Contraseña Actual',
      required: true,
    }),
    createElement('input', {
      type: 'password',
      name: 'newPassword',
      placeholder: 'Nueva Contraseña',
      required: true,
    }),
    createElement('input', {
      type: 'password',
      name: 'confirmPassword',
      placeholder: 'Confirmar Nueva Contraseña',
      required: true,
    }),
    createElement('button', { type: 'submit' }, 'Actualizar Contraseña')
  )

  const deleteButton = createElement(
    'button',
    {
      className: 'delete-account',
      onclick: async () => {
        const password = prompt(
          'Para eliminar tu cuenta, por favor, introduce tu contraseña:'
        )
        if (password === null) return

        try {
          await userService.deleteAccount(user.id, password)
          alert('Cuenta eliminada exitosamente.')
          router.navigateTo('/')
        } catch (error) {
          alert(`Error: ${error.message}`)
        }
      },
    },
    'Eliminar cuenta'
  )

  accountSection.append(
    createElement('h3', {}, 'Gestionar Cuenta'),
    changePasswordForm,
    deleteButton
  )

  return accountSection
}

function createFavoritesSection(favorites, router) {
  const favoritesSection = createElement(
    'div',
    { className: 'favorites-section' },
    createElement('h2', {}, 'Mis Favoritos')
  )

  if (!favorites || favorites.length === 0) {
    favoritesSection.appendChild(
      createElement('p', { className: 'empty-favorites' }, 'No tienes productos favoritos aún.')
    )
  } else {
    const favoritesList = createElement('div', { className: 'favorites-grid' })
    
    favorites.forEach((favorite) => {
      let imgSrc = favorite.url.startsWith('/') || favorite.url.startsWith('http')
          ? favorite.url
          : '/' + favorite.url
      
      const favoriteHeader = createElement(
        'div',
        { className: 'favorite-header' },
        createElement('h4', {}, favorite.name),
        createHeartButton(favorite.asset_id, { size: '18', className: 'profile-heart' })
      )
      
      const favoriteCard = createElement(
        'div',
        {
          className: 'favorite-card',
          onclick: () => {
            const img = favoriteCard.querySelector('img');
            const title = favoriteCard.querySelector('h4');
            if (img) img.style.viewTransitionName = `product-image-${favorite.product_id}`;
            if (title) title.style.viewTransitionName = `product-title-${favorite.product_id}`;
            
            router.navigateTo(`/product/${favorite.product_id}`);
          },
        },
        createElement('img', {
          src: imgSrc,
          alt: favorite.name,
        }),
        favoriteHeader,
        createElement('p', { className: 'favorite-price' }, `${favorite.price}`),
        createElement(
          'button',
          {
            className: 'add-to-cart-from-favorites',
            onclick: async (e) => {
              e.stopPropagation(); // Prevent navigation
              try {
                await addToCart(favorite.asset_id, 1)
                alert('Producto agregado al carrito')
              } catch (error) {
                alert('Error al agregar al carrito')
              }
            }
          },
          'Agregar al carrito'
        )
      )
      
      favoritesList.appendChild(favoriteCard)
    })
    
    favoritesSection.appendChild(favoritesList)
  }

  return favoritesSection
}
