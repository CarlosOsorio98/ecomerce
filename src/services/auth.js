import { setUser, logout } from "../state.js";

const STORAGE_KEY = "auth_user";

export class AuthService {
  constructor() {
    // Intentar restaurar la sesión al iniciar
    this.checkSession();
  }

  checkSession() {
    const savedUser = localStorage.getItem(STORAGE_KEY);
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setUser(user);
      } catch (error) {
        console.error("Error al restaurar la sesión:", error);
        this.signOut();
      }
    }
  }

  async signIn(email, password) {
    // Validaciones básicas
    if (!email || !password) {
      throw new Error("Email y contraseña son requeridos");
    }

    // Obtener usuarios registrados
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const user = users.find(
      (u) => u.email === email && u.password === password
    );

    if (!user) {
      throw new Error("Credenciales inválidas");
    }

    // Eliminar la contraseña antes de almacenar en el estado
    const { password: _, ...userWithoutPassword } = user;

    // Guardar en localStorage y estado global
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userWithoutPassword));
    setUser(userWithoutPassword);

    return userWithoutPassword;
  }

  async signUp(userData) {
    const { email, password, name } = userData;

    // Validaciones básicas
    if (!email || !password || !name) {
      throw new Error("Todos los campos son requeridos");
    }

    // Obtener usuarios existentes
    const users = JSON.parse(localStorage.getItem("users") || "[]");

    // Verificar si el email ya está registrado
    if (users.some((user) => user.email === email)) {
      throw new Error("El email ya está registrado");
    }

    // Crear nuevo usuario
    const newUser = {
      id: Date.now().toString(),
      email,
      password,
      name,
      createdAt: new Date().toISOString(),
    };

    // Guardar en localStorage
    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    // Iniciar sesión automáticamente
    return this.signIn(email, password);
  }

  signOut() {
    localStorage.removeItem(STORAGE_KEY);
    logout();
  }
}

// Exportar una instancia única del servicio
export const authService = new AuthService();
