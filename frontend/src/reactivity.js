/**
 * @file reactivity.js
 * @description
 * Este archivo contiene el núcleo del sistema de "reactividad" de la aplicación.
 * La reactividad significa que cuando un dato cambia, la interfaz de usuario (u otras partes
 * del código) que dependen de ese dato, reaccionan y se actualizan automáticamente.
 *
 * Lo logramos implementando un patrón de diseño muy común llamado "Patrón Observador" (Observer Pattern).
 * - Hay un "Observable" (el objeto que es observado, en nuestro caso, una pieza del estado).
 * - Hay "Observadores" o "Suscriptores" (el código que quiere saber cuándo cambia el Observable).
 *
 * Cuando el valor del Observable cambia, este "notifica" a todos sus suscriptores.
 */

/**
 * La clase Observable envuelve un valor y notifica a los suscriptores cuando este cambia.
 */
export class Observable {
  /**
   * @param {*} value - El valor inicial que será observado.
   */
  constructor(value) {
    this._value = value
    // Usamos un `Set` para almacenar los suscriptores. Un Set es como un array
    // pero solo permite valores únicos, lo que evita que un mismo suscriptor
    // se registre varias veces.
    this._subscribers = new Set()
  }

  /**
   * Un "getter" para acceder al valor. Nos permite leer `observable.value`
   * como si fuera una propiedad normal.
   */
  get value() {
    return this._value
  }

  /**
   * Un "setter" para cambiar el valor. Al usar un setter, podemos ejecutar
   * código adicional (como notificar a los suscriptores) cada vez que el valor
   * es modificado con `observable.value = newValue`.
   */
  set value(newValue) {
    // Solo notificamos si el valor realmente ha cambiado.
    if (!this._deepEqual(this._value, newValue)) {
      this._value = newValue
      this._notify()
    }
  }

  /**
   * Compara dos valores de manera profunda (deep comparison).
   * Para arrays y objetos, compara su contenido, no solo la referencia.
   */
  _deepEqual(a, b) {
    if (a === b) return true
    if (a == null || b == null) return false
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false
      for (let i = 0; i < a.length; i++) {
        if (!this._deepEqual(a[i], b[i])) return false
      }
      return true
    }
    if (typeof a === 'object' && typeof b === 'object') {
      const keysA = Object.keys(a)
      const keysB = Object.keys(b)
      if (keysA.length !== keysB.length) return false
      for (const key of keysA) {
        if (!keysB.includes(key)) return false
        if (!this._deepEqual(a[key], b[key])) return false
      }
      return true
    }
    return false
  }

  /**
   * Permite que un nuevo "suscriptor" (una función callback) se registre
   * para escuchar los cambios de este observable.
   * @param {Function} subscriber - La función que se ejecutará cuando el valor cambie.
   * @returns {Function} Una función que, al ser llamada, desuscribe al suscriptor.
   */
  subscribe(subscriber) {
    this._subscribers.add(subscriber)
    // Opcional pero útil: Al suscribirse, ejecutamos inmediatamente el callback
    // con el valor actual, para que el suscriptor tenga el estado inicial.
    subscriber(this._value)

    // Devolvemos una función que permite "limpiar" la suscripción.
    // Esto es muy importante para evitar fugas de memoria (memory leaks).
    return () => {
      this._subscribers.delete(subscriber)
    }
  }

  /**
   * Notifica a todos los suscriptores llamando a sus funciones callback
   * con el nuevo valor. Es un método privado (convención del `_`).
   */
  _notify() {
    for (const subscriber of this._subscribers) {
      subscriber(this._value)
    }
  }
}

/**
 * Función "Factory" que crea un almacén de estado (store) reactivo.
 * Un store es un objeto que agrupa varias piezas de estado observables.
 * @param {object} initialState - El objeto con el estado inicial de la aplicación.
 * @returns {object} El objeto `store` con métodos para interactuar con el estado.
 */
export function createStore(initialState = {}) {
  const state = {}

  // Convertimos cada propiedad del estado inicial en un `Observable`.
  // Así, en lugar de tener `state = { user: null }`, tendremos
  // `state = { user: new Observable(null) }`.
  for (const [key, value] of Object.entries(initialState)) {
    state[key] = new Observable(value)
  }

  // Devolvemos la interfaz pública de nuestro store.
  // Quienes usen el store no interactuarán directamente con los Observables,
  // sino con estos métodos, que proporcionan una API más limpia.
  return {
    /**
     * Devuelve un objeto con los valores actuales del estado.
     * Desenvuelve los valores de los Observables.
     */
    getState() {
      const currentState = {}
      for (const [key, observable] of Object.entries(state)) {
        currentState[key] = observable.value
      }
      return currentState
    },

    /**
     * Actualiza una o más propiedades del estado.
     * @param {object} newState - Un objeto con las claves y nuevos valores a actualizar.
     */
    setState(newState) {
      for (const [key, value] of Object.entries(newState)) {
        if (state[key]) {
          // Si la propiedad ya existe, simplemente actualizamos su valor.
          // Esto disparará el setter del Observable y notificará a los suscriptores.
          state[key].value = value
        } else {
          // Si es una nueva propiedad, creamos un nuevo Observable para ella.
          state[key] = new Observable(value)
        }
      }
    },

    /**
     * Permite suscribirse a los cambios de una propiedad específica del estado.
     * @param {string} key - La clave del estado a la que suscribirse (ej. "isAuthenticated").
     * @param {Function} callback - La función a ejecutar cuando esa clave cambie.
     */
    subscribe(key, callback) {
      if (state[key]) {
        return state[key].subscribe(callback)
      }
      // Si la clave no existe, devolvemos una función vacía para evitar errores.
      return () => {}
    },
  }
}
