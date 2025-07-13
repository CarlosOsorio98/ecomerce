/* eslint-disable camelcase */
import { createStore } from './reactivity.js'
import { cartService } from './services/cart.js'

const initialState = {
  user: null,
  isAuthenticated: false,
  currentRoute: window.location.pathname,
  cart: [],
}

export const store = createStore(initialState)

export const getUser = () => store.getState().user
export const isAuthenticated = () => store.getState().isAuthenticated
export const getCurrentRoute = () => store.getState().currentRoute
export const getCart = () => store.getState().cart

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

export const logout = () => {
  store.setState({
    user: null,
    isAuthenticated: false,
    cart: [],
  })
}
