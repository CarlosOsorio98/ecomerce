/**
 * @file auth.js
 * @description
 * Este archivo define el `AuthService` (Servicio de Autenticación).
 * Un "servicio" en arquitectura de software es una clase que encapsula una lógica de negocio específica.
 * En este caso, toda la lógica relacionada con la autenticación de usuarios: iniciar sesión,
 * registrarse, cerrar sesión y verificar la sesión actual.
 */
import { logout, setUser } from "../state.js";
import { userApi } from "./user.js";

export class AuthService {
  /**
   * El constructor se ejecuta automáticamente cuando se crea una nueva instancia de la clase.
   * Aquí lo usamos para comprobar si ya existe una sesión de usuario guardada.
   */
  constructor() {
    // No hay sesión persistente en localStorage, solo en memoria
  }

  /**
   * Comprueba si hay una sesión activa en el backend (cookie JWT).
   * Si existe, actualiza el estado global con el usuario autenticado.
   * Además, guarda el resultado en localStorage para debug.
   */
  async checkSession() {
    try {
      const res = await fetch("/api/session", { credentials: "include" });
      const debugInfo = { status: res.status, ok: res.ok };
      if (!res.ok) {
        debugInfo.result = await res.text();
        localStorage.setItem("debug_session", JSON.stringify(debugInfo));
        console.debug("[checkSession] No session:", debugInfo);
        localStorage.removeItem("user_session");
        return;
      }
      const user = await res.json();
      debugInfo.user = user;
      localStorage.setItem("debug_session", JSON.stringify(debugInfo));
      localStorage.setItem("user_session", JSON.stringify(user));
      setUser(user);
      console.debug("[checkSession] Session restored:", user);
    } catch (e) {
      localStorage.setItem(
        "debug_session",
        JSON.stringify({ error: e.message })
      );
      console.error("[checkSession] Error:", e);
      localStorage.removeItem("user_session");
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
    const user = await userApi.login({ email, password });

    if (!user) {
      throw new Error("Credenciales inválidas");
    }

    // Guardar debug del login
    localStorage.setItem("debug_login", JSON.stringify(user));

    // ¡Buena práctica de seguridad! Nunca guardes la contraseña en el estado global o en la sesión.
    // Usamos "desestructuración con resto" para crear un nuevo objeto sin la propiedad `password`.
    const { password: _, ...userWithoutPassword } = user;

    // Actualizamos el estado global para que toda la app sepa que el usuario ha iniciado sesión.
    setUser(userWithoutPassword);

    // Esperar a que la cookie esté lista y sincronizar estado
    await this.checkSession();

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

    const user = await userApi.register({ name, email, password });

    // No loguea automáticamente

    return user;
  }

  /**
   * Cierra la sesión del usuario actual.
   */
  signOut() {
    // Llamamos a la acción `logout` para limpiar el estado global.
    logout();
  }
}

// Exportamos una única instancia del servicio (Patrón Singleton).
// Esto asegura que toda la aplicación use el mismo objeto AuthService,
// manteniendo la consistencia.
export const authService = new AuthService();
