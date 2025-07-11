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
import { cartService } from "./services/cart.js";

// --- ESTADO INICIAL ---
// Este es el estado por defecto de la aplicación cuando se carga por primera vez.
const initialState = {
  user: null, // No hay usuario conectado al principio.
  isAuthenticated: false, // Por lo tanto, no está autenticado.
  currentRoute: window.location.pathname, // La ruta actual.
  cart: [], // El carrito se sincroniza con la API
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
 * Sincroniza el carrito con la API y actualiza el estado global
 */
export const syncCart = async () => {
  try {
    const cart = await cartService.getCart();
    store.setState({ cart });
  } catch {
    store.setState({ cart: [] });
  }
};

/**
 * Agrega un producto al carrito de compras.
 * @param {string} asset_id - El ID del activo a agregar.
 * @param {number} quantity - La cantidad del producto.
 */
export const addToCart = async (asset_id, quantity) => {
  await cartService.addToCart(asset_id, quantity);
  await syncCart();
};

/**
 * Elimina un producto completamente del carrito.
 * @param {string} id - El ID del producto a eliminar.
 */
export const removeFromCart = async (id) => {
  await cartService.removeFromCart(id);
  await syncCart();
};

/**
 * Actualiza la cantidad de un item específico en el carrito.
 * Si la cantidad llega a 0, el item es eliminado.
 * @param {string} asset_id - El ID del producto a actualizar.
 * @param {number} newQuantity - La nueva cantidad total del producto.
 */
export const updateCartItemQuantity = async (asset_id, newQuantity) => {
  // Para actualizar cantidad, usamos addToCart con la diferencia
  const cart = store.getState().cart;
  const item = cart.find((i) => i.asset_id === asset_id);
  if (!item) return;
  const diff = newQuantity - item.quantity;
  if (diff === 0) return;
  if (newQuantity <= 0) {
    await removeFromCart(item.id);
  } else {
    await addToCart(asset_id, diff);
  }
};

/**
 * Cierra la sesión del usuario, limpiando sus datos del estado.
 */
export const logout = () => {
  store.setState({
    user: null,
    isAuthenticated: false,
    cart: [],
  });
};
