import { createStore } from "./reactivity.js";

const initialCart = JSON.parse(localStorage.getItem("cart") || "[]");

// Estado inicial de la aplicación
const initialState = {
  user: null,
  isAuthenticated: false,
  currentRoute: window.location.pathname,
  cart: initialCart,
};

// Crear store global
export const store = createStore(initialState);

// Getters convenientes
export const getUser = () => store.getState().user;
export const isAuthenticated = () => store.getState().isAuthenticated;
export const getCurrentRoute = () => store.getState().currentRoute;
export const getCart = () => store.getState().cart;

// Acciones para modificar el estado
export const setUser = (user) => {
  store.setState({
    user,
    isAuthenticated: !!user,
  });
};

export const setCurrentRoute = (route) => {
  store.setState({ currentRoute: route });
};

export const addToCart = (product, quantity) => {
  const currentCart = store.getState().cart;
  const existingProductIndex = currentCart.findIndex(
    (item) => item.id === product.id
  );

  let updatedCart;

  if (existingProductIndex > -1) {
    // Si el producto ya existe, actualiza la cantidad
    updatedCart = currentCart.map((item, index) =>
      index === existingProductIndex
        ? { ...item, quantity: item.quantity + quantity }
        : item
    );
  } else {
    // Si es un producto nuevo, lo agrega al carrito
    updatedCart = [...currentCart, { ...product, quantity }];
  }

  localStorage.setItem("cart", JSON.stringify(updatedCart));
  store.setState({ cart: updatedCart });
};

export const logout = () => {
  store.setState({
    user: null,
    isAuthenticated: false,
  });
};
