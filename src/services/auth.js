/**
 * @file auth.js
 * @description
 * Este archivo define el `AuthService` (Servicio de Autenticación).
 * Un "servicio" en arquitectura de software es una clase que encapsula una lógica de negocio específica.
 * En este caso, toda la lógica relacionada con la autenticación de usuarios: iniciar sesión,
 * registrarse, cerrar sesión y verificar la sesión actual.
 *
 * NOTA IMPORTANTE PARA EL APRENDIZAJE:
 * Este servicio es una **simulación**. En una aplicación real, en lugar de usar `localStorage`
 * para guardar y comprobar usuarios, aquí se harían peticiones de red (con `fetch`) a un
 * servidor backend (una API) que se encargaría de gestionar los usuarios en una base de datos real.
 * Usamos `localStorage` para poder prototipar y probar la lógica del frontend sin necesitar un backend.
 */
import { logout, setUser } from "../state.js";

// Esta es la clave que usaremos en localStorage para guardar los datos del usuario logueado.
const STORAGE_KEY = "auth_user";

export class AuthService {
  /**
   * El constructor se ejecuta automáticamente cuando se crea una nueva instancia de la clase.
   * Aquí lo usamos para comprobar si ya existe una sesión de usuario guardada.
   */
  constructor() {
    this.checkSession();
  }

  /**
   * Comprueba si hay un usuario guardado en localStorage y, si es así,
   * actualiza el estado global de la aplicación para reflejar que el usuario está logueado.
   */
  checkSession() {
    const savedUser = localStorage.getItem(STORAGE_KEY);
    if (savedUser) {
      try {
        // `JSON.parse` convierte el string guardado en localStorage de nuevo a un objeto JavaScript.
        const user = JSON.parse(savedUser);
        // `setUser` es la acción de nuestro gestor de estado que actualiza la información del usuario.
        setUser(user);
      } catch (error) {
        console.error("Error al restaurar la sesión:", error);
        // Si hay un error (ej. los datos guardados están corruptos), cerramos la sesión por seguridad.
        this.signOut();
      }
    }
  }

  /**
   * Simula el inicio de sesión de un usuario.
   * @param {string} email - El email del usuario.
   * @param {string} password - La contraseña del usuario.
   * @returns {Promise<object>} Una promesa que se resuelve con los datos del usuario (sin contraseña).
   * @throws {Error} Si las credenciales son inválidas.
   */
  async signIn(email, password) {
    // La palabra `async` convierte esta función en asíncrona, lo que nos permite usar `await` dentro.
    // Aunque aquí no hay una petición de red real, es una buena práctica hacer los métodos de servicio
    // asíncronos, ya que en el futuro sí podrían serlo.

    if (!email || !password) {
      throw new Error("Email y contraseña son requeridos");
    }

    // Obtenemos la "tabla" de usuarios de localStorage.
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    // Buscamos un usuario que coincida. En una app real, esto sería una consulta a la base de datos.
    const user = users.find(
      (u) => u.email === email && u.password === password // ¡OJO! Guardar contraseñas en texto plano es muy inseguro.
    );

    if (!user) {
      throw new Error("Credenciales inválidas");
    }

    // ¡Buena práctica de seguridad! Nunca guardes la contraseña en el estado global o en la sesión.
    // Usamos "desestructuración con resto" para crear un nuevo objeto sin la propiedad `password`.
    const { password: _, ...userWithoutPassword } = user;

    // Guardamos al usuario en localStorage para persistir la sesión.
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userWithoutPassword));
    // Actualizamos el estado global para que toda la app sepa que el usuario ha iniciado sesión.
    setUser(userWithoutPassword);

    return userWithoutPassword;
  }

  /**
   * Simula el registro de un nuevo usuario.
   * @param {object} userData - Datos del nuevo usuario (nombre, email, contraseña).
   * @returns {Promise<object>} Una promesa que se resuelve con los datos del usuario logueado.
   * @throws {Error} Si los datos son inválidos o el email ya existe.
   */
  async signUp(userData) {
    const { email, password, name } = userData;

    if (!email || !password || !name) {
      throw new Error("Todos los campos son requeridos");
    }

    const users = JSON.parse(localStorage.getItem("users") || "[]");

    if (users.some((user) => user.email === email)) {
      throw new Error("El email ya está registrado");
    }

    // Creamos el objeto para el nuevo usuario.
    const newUser = {
      id: Date.now().toString(), // Usamos un timestamp como ID simple y único.
      email,
      password, // De nuevo, esto es inseguro, solo para la simulación.
      name,
      createdAt: new Date().toISOString(),
    };

    // Añadimos el nuevo usuario a nuestra "base de datos" y guardamos.
    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    // Tras un registro exitoso, iniciamos sesión automáticamente.
    return this.signIn(email, password);
  }

  /**
   * Cierra la sesión del usuario actual.
   */
  signOut() {
    // Eliminamos los datos de la sesión de localStorage.
    localStorage.removeItem(STORAGE_KEY);
    // Llamamos a la acción `logout` para limpiar el estado global.
    logout();
  }
}

// Exportamos una única instancia del servicio (Patrón Singleton).
// Esto asegura que toda la aplicación use el mismo objeto AuthService,
// manteniendo la consistencia.
export const authService = new AuthService();
