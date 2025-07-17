/* eslint-disable camelcase */
import { createStore } from './reactivity.js'
import { cartService } from '~/services/cart.js'
import { favoritesService } from '~/services/favorites.js'

const initialState = {
  user: null,
  isAuthenticated: false,
  currentRoute: window.location.pathname,
  cart: [],
  favorites: [],
}

export const store = createStore(initialState)

export const getUser = () => store.getState().user
export const isAuthenticated = () => store.getState().isAuthenticated
export const getCurrentRoute = () => store.getState().currentRoute
export const getCart = () => store.getState().cart
export const getFavorites = () => store.getState().favorites

export const setUser = (user) => {
  store.setState({
    user,
    isAuthenticated: !!user,
  })
}

export const setCurrentRoute = (route) => {
  store.setState({ currentRoute: route })
}

export const syncCart = async () => {
  if (!isAuthenticated()) {
    store.setState({ cart: [] })
    return
  }
  
  try {
    const cart = await cartService.getCart()
    store.setState({ cart })
  } catch (error) {
    console.error('Error al sincronizar carrito:', error)
    store.setState({ cart: [] })
  }
}

export const addToCart = async (asset_id, quantity) => {
  await cartService.addToCart(asset_id, quantity)
  await syncCart()
}

export const removeFromCart = async (id) => {
  await cartService.removeFromCart(id)
  await syncCart()
}

export const updateCartItemQuantity = async (asset_id, newQuantity) => {
  const cart = store.getState().cart
  const item = cart.find((i) => i.asset_id === asset_id)
  if (!item) return

  const diff = newQuantity - item.quantity
  if (diff === 0) return
  if (newQuantity <= 0) {
    await removeFromCart(item.id)
  } else {
    await addToCart(asset_id, diff)
  }
}

export const syncFavorites = async () => {
  if (!isAuthenticated()) {
    store.setState({ favorites: [] })
    return
  }
  try {
    const favorites = await favoritesService.getFavorites()
    store.setState({ favorites })
  } catch (error) {
    console.error('Error al sincronizar favoritos:', error)
    store.setState({ favorites: [] })
  }
}

export const toggleFavorite = async (assetId) => {
  if (!isAuthenticated()) {
    throw new Error('Debes iniciar sesión para usar favoritos')
  }

  // Optimistic update
  const currentFavorites = store.getState().favorites
  const isCurrentlyFavorite = currentFavorites.some(fav => fav.asset_id === assetId)
  
  if (isCurrentlyFavorite) {
    // Remove from favorites optimistically
    const newFavorites = currentFavorites.filter(fav => fav.asset_id !== assetId)
    store.setState({ favorites: newFavorites })
  } else {
    // We don't have full asset data for optimistic add, so we'll just sync after API call
  }

  try {
    const result = await favoritesService.toggleFavorite(assetId)
    // Always sync after API call to ensure consistency
    await syncFavorites()
    return result
  } catch (error) {
    // Revert optimistic update on error
    await syncFavorites()
    throw error
  }
}

export const isFavorite = (assetId) => {
  const favorites = store.getState().favorites
  return favorites.some(fav => fav.asset_id === assetId)
}

export const logout = () => {
  store.setState({
    user: null,
    isAuthenticated: false,
    cart: [],
    favorites: [],
  })
  
  // Additional cleanup to ensure state is completely reset
  try {
    localStorage.removeItem('user_session')
    localStorage.removeItem('auth_user')
    sessionStorage.removeItem('user_session')
    sessionStorage.removeItem('auth_user')
  } catch (e) {
    console.warn('Failed to clear storage during logout:', e)
  }
}
