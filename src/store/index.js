import { create } from 'zustand'
import { authService, setStoreActions } from '../services/auth.js'
import { setStoreActions as setUserStoreActions } from '../services/user.js'
import { cartService } from '../services/cart.js'

// Create the main store
export const useStore = create((set, get) => ({
  // Auth state
  user: null,
  isAuthenticated: false,

  // Cart state
  cart: [],

  // Favorites state
  favorites: [],

  // Loading states
  authLoading: false,
  cartLoading: false,
  favoritesLoading: false,

  // Auth actions
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),

  signIn: async (email, password) => {
    set({ authLoading: true })
    try {
      const result = await authService.signIn(email, password)
      set({ 
        user: result.user, 
        isAuthenticated: true,
        authLoading: false
      })
      return result
    } catch (error) {
      set({ authLoading: false })
      throw error
    }
  },

  signUp: async (userData) => {
    set({ authLoading: true })
    try {
      const result = await authService.signUp(userData)
      set({ authLoading: false })
      return result
    } catch (error) {
      set({ authLoading: false })
      throw error
    }
  },

  signOut: async () => {
    set({ authLoading: true })
    try {
      await authService.signOut()
      set({
        user: null,
        isAuthenticated: false,
        cart: [],
        favorites: [],
        authLoading: false,
        cartLoading: false,
        favoritesLoading: false
      })
    } catch (error) {
      set({ authLoading: false })
      throw error
    }
  },

  checkSession: async () => {
    set({ authLoading: true })
    try {
      const result = await authService.checkSession()
      if (result && result.user) {
        set({ 
          user: result.user, 
          isAuthenticated: true,
          authLoading: false
        })
      } else {
        set({ 
          user: null, 
          isAuthenticated: false,
          authLoading: false
        })
      }
      return result
    } catch (error) {
      set({ 
        user: null, 
        isAuthenticated: false,
        authLoading: false
      })
      return null
    }
  },

  // Cart actions
  setCart: (cart) => set({ cart }),

  addToCart: async (productId, quantity = 1) => {
    const { isAuthenticated } = get()
    if (!isAuthenticated) {
      throw new Error('User must be authenticated to add items to cart')
    }

    set({ cartLoading: true })
    try {
      const result = await cartService.addToCart(productId, quantity)
      const cart = await cartService.getCart()
      set({ 
        cart: cart || [],
        cartLoading: false
      })
      return result
    } catch (error) {
      set({ cartLoading: false })
      throw error
    }
  },

  removeFromCart: async (itemId) => {
    set({ cartLoading: true })
    try {
      await cartService.removeFromCart(itemId)
      const { cart } = get()
      set({
        cart: cart.filter(item => item.id !== itemId),
        cartLoading: false
      })
    } catch (error) {
      set({ cartLoading: false })
      throw error
    }
  },

  syncCart: async () => {
    const { isAuthenticated } = get()
    if (!isAuthenticated) {
      set({ cart: [] })
      return
    }

    set({ cartLoading: true })
    try {
      const cart = await cartService.getCart()
      set({ 
        cart: cart || [],
        cartLoading: false
      })
    } catch (error) {
      set({ 
        cart: [],
        cartLoading: false
      })
    }
  },

  // Favorites actions
  setFavorites: (favorites) => set({ favorites }),

  toggleFavorite: async (productId) => {
    const { isAuthenticated, favorites } = get()
    if (!isAuthenticated) {
      throw new Error('User must be authenticated to manage favorites')
    }

    set({ favoritesLoading: true })
    try {
      const isFavorite = favorites.some(fav => fav.id === productId)
      let newFavorites
      if (isFavorite) {
        newFavorites = favorites.filter(fav => fav.id !== productId)
      } else {
        newFavorites = [...favorites, { id: productId }]
      }
      
      set({ 
        favorites: newFavorites,
        favoritesLoading: false
      })
    } catch (error) {
      set({ favoritesLoading: false })
      throw error
    }
  },

  syncFavorites: async () => {
    const { isAuthenticated } = get()
    if (!isAuthenticated) {
      set({ favorites: [] })
      return
    }

    set({ favoritesLoading: true })
    try {
      set({ favoritesLoading: false })
    } catch (error) {
      set({ 
        favorites: [],
        favoritesLoading: false
      })
    }
  },

  // Utility functions
  isFavorite: (productId) => {
    const { favorites } = get()
    return favorites.some(fav => fav.id === productId)
  }
}))

// Export individual hooks for convenience
export const useAuth = () => {
  const user = useStore(state => state.user)
  const isAuthenticated = useStore(state => state.isAuthenticated)
  const loading = useStore(state => state.authLoading)
  const signIn = useStore(state => state.signIn)
  const signUp = useStore(state => state.signUp)
  const signOut = useStore(state => state.signOut)
  const checkSession = useStore(state => state.checkSession)
  
  return {
    user,
    isAuthenticated, 
    loading,
    signIn,
    signUp,
    signOut,
    checkSession
  }
}

export const useCart = () => {
  const cart = useStore(state => state.cart)
  const loading = useStore(state => state.cartLoading)
  const addToCart = useStore(state => state.addToCart)
  const removeFromCart = useStore(state => state.removeFromCart)
  const syncCart = useStore(state => state.syncCart)
  
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
  
  return {
    cart,
    loading,
    totalPrice,
    totalItems,
    addToCart,
    removeFromCart,
    syncCart
  }
}

export const useFavorites = () => {
  const favorites = useStore(state => state.favorites)
  const loading = useStore(state => state.favoritesLoading)
  const toggleFavorite = useStore(state => state.toggleFavorite)
  const syncFavorites = useStore(state => state.syncFavorites)
  const isFavorite = useStore(state => state.isFavorite)
  
  return {
    favorites,
    loading,
    toggleFavorite,
    syncFavorites,
    isFavorite
  }
}

// Initialize the auth and user services with store actions
const storeActions = {
  setUser: useStore.getState().setUser,
  setAuthenticated: useStore.getState().setAuthenticated
}

setStoreActions(storeActions)
setUserStoreActions(storeActions)