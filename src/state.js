/**
 * @file state.js
 * @description
 * Este archivo centraliza el "estado" de toda la aplicación.
 * El estado es básicamente un objeto JavaScript que contiene todos los datos
 * importantes que la aplicación necesita para funcionar en un momento dado.
 * Por ejemplo: ¿el usuario está conectado?, ¿qué hay en el carrito?, ¿en qué página estamos?
 *
 * Tener un estado centralizado (conocido como "Single Source of Truth" o Fuente Única de Verdad)
 * hace que la aplicación sea más predecible y fácil de depurar, ya que todos los datos
 * fluyen de un único lugar.
 *
 * Aquí definimos:
 * 1. El estado inicial.
 * 2. El "store" o almacén que contendrá y gestionará el estado.
 * 3. "Getters": Funciones para LEER datos del estado.
 * 4. "Actions": Funciones para MODIFICAR datos del estado.
 */
import { createStore } from "./reactivity.js";

// Intentamos cargar el carrito desde localStorage. Si no hay nada, empezamos con un array vacío.
// `localStorage` es un pequeño almacenamiento en el navegador que persiste incluso si se cierra la pestaña.
const initialCart = JSON.parse(localStorage.getItem("cart") || "[]");

// --- ESTADO INICIAL ---
// Este es el estado por defecto de la aplicación cuando se carga por primera vez.
const initialState = {
  user: null, // No hay usuario conectado al principio.
  isAuthenticated: false, // Por lo tanto, no está autenticado.
  currentRoute: window.location.pathname, // La ruta actual.
  cart: initialCart, // El carrito de compras.
};

// --- STORE GLOBAL ---
// Creamos el 'store' (almacén) usando nuestra función `createStore` de `reactivity.js`.
// El store es el objeto que contendrá nuestro estado y nos permitirá interactuar con él.
export const store = createStore(initialState);

// --- GETTERS ---
// Los getters son funciones simples que nos dan una forma limpia y centralizada
// de acceder a piezas específicas del estado desde cualquier parte de la aplicación.
export const getUser = () => store.getState().user;
export const isAuthenticated = () => store.getState().isAuthenticated;
export const getCurrentRoute = () => store.getState().currentRoute;
export const getCart = () => store.getState().cart;

// --- ACCIONES (ACTIONS) ---
// Las acciones son funciones que modifican el estado. Es una buena práctica
// no modificar el estado directamente, sino a través de estas acciones.
// Esto hace que los cambios de estado sean más controlados y predecibles.

/**
 * Actualiza los datos del usuario en el estado.
 * @param {object | null} user - El objeto del usuario o `null` si se cierra sesión.
 */
export const setUser = (user) => {
  store.setState({
    user,
    isAuthenticated: !!user, // `!!` convierte el objeto a un booleano (true si hay usuario, false si es null).
  });
};

/**
 * Actualiza la ruta actual en el estado.
 * @param {string} route - La nueva ruta.
 */
export const setCurrentRoute = (route) => {
  store.setState({ currentRoute: route });
};

/**
 * Agrega un producto al carrito de compras.
 * @param {object} product - El producto a agregar.
 * @param {number} quantity - La cantidad del producto.
 */
export const addToCart = (product, quantity) => {
  // Obtenemos el estado actual del carrito para no modificarlo directamente.
  const currentCart = store.getState().cart;
  const existingProductIndex = currentCart.findIndex(
    (item) => item.id === product.id
  );

  let updatedCart;

  if (existingProductIndex > -1) {
    // Si el producto ya existe, creamos un nuevo array donde actualizamos solo la cantidad de ese producto.
    // Usamos `.map()` para no mutar el array original.
    updatedCart = currentCart.map((item, index) =>
      index === existingProductIndex
        ? { ...item, quantity: item.quantity + quantity }
        : item
    );
  } else {
    // Si es un producto nuevo, creamos un nuevo array con el producto anterior más el nuevo.
    // El "spread operator" (`...`) es clave para la inmutabilidad.
    updatedCart = [...currentCart, { ...product, quantity }];
  }

  // Guardamos el carrito actualizado en localStorage para que no se pierda.
  localStorage.setItem("cart", JSON.stringify(updatedCart));
  // Y actualizamos el estado global, lo que notificará a los suscriptores.
  store.setState({ cart: updatedCart });
};

/**
 * Elimina un producto completamente del carrito.
 * @param {string} productId - El ID del producto a eliminar.
 */
export const removeFromCart = (productId) => {
  const currentCart = store.getState().cart;
  const updatedCart = currentCart.filter((item) => item.id !== productId);

  localStorage.setItem("cart", JSON.stringify(updatedCart));
  store.setState({ cart: updatedCart });
};

/**
 * Actualiza la cantidad de un item específico en el carrito.
 * Si la cantidad llega a 0, el item es eliminado.
 * @param {string} productId - El ID del producto a actualizar.
 * @param {number} newQuantity - La nueva cantidad total del producto.
 */
export const updateCartItemQuantity = (productId, newQuantity) => {
  if (newQuantity <= 0) {
    removeFromCart(productId);
    return;
  }

  const currentCart = store.getState().cart;
  const updatedCart = currentCart.map((item) =>
    item.id === productId ? { ...item, quantity: newQuantity } : item
  );

  localStorage.setItem("cart", JSON.stringify(updatedCart));
  store.setState({ cart: updatedCart });
};

/**
 * Cierra la sesión del usuario, limpiando sus datos del estado.
 */
export const logout = () => {
  store.setState({
    user: null,
    isAuthenticated: false,
  });
  // También podríamos querer limpiar el carrito al cerrar sesión.
  // localStorage.removeItem('cart');
  // store.setState({ cart: [] });
};
