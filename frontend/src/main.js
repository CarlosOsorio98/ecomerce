/**
 * @file main.js
 * @description
 * Este es el archivo principal y el punto de entrada de toda la aplicación.
 * Ahora, con el código refactorizado, su responsabilidad principal es:
 * 1. Importar todas las piezas modulares (vistas, componentes, servicios).
 * 2. Crear las instancias de los objetos principales (Router, Servicios).
 * 3. Configurar el enrutador con las vistas, inyectando las dependencias necesarias.
 * 4. Inicializar la aplicación.
 */

import { authService } from "./services/auth.js";
import { createElement, createRouter } from "./spa.js";
import { store } from "./state.js";

// Importar las Vistas (factorías que crean las vistas)
import { HomeView } from "./views/home.js";
import { LoginView } from "./views/login.js";
import { ProfileView } from "./views/profile.js";
import { RegisterView } from "./views/register.js";

// --- OBTENER RUTA BASE ---
const basePath = document
  .querySelector('script[src*="main.js"]')
  .getAttribute("src")
  .replace("src/main.js", "");

/**
 * Renderiza la barra de navegación.
 * Su contenido cambia dependiendo de si el usuario está autenticado o no.
 */
function renderNavbar() {
  const navLinks = document.getElementById("main-nav-links");
  const isAuthenticated = store.getState().isAuthenticated;
  const user = store.getState().user;

  navLinks.innerHTML = "";

  const homeLink = createElement(
    "li",
    {},
    createElement("a", { href: "/", "data-link": true }, "Inicio")
  );
  navLinks.appendChild(homeLink);

  if (isAuthenticated && user) {
    const profileLink = createElement(
      "li",
      {},
      createElement("a", { href: "/profile", "data-link": true }, user.name)
    );
    const logoutButtonLi = createElement("li", {});
    const logoutButton = createElement(
      "button",
      {
        className: "logout-button",
        onclick: (e) => {
          e.preventDefault();
          authService.signOut();
          router.navigateTo("/");
        },
      },
      "Cerrar sesión"
    );

    logoutButtonLi.appendChild(logoutButton);
    navLinks.appendChild(profileLink);
    navLinks.appendChild(logoutButtonLi);
  } else {
    const loginLink = createElement(
      "li",
      {},
      createElement(
        "a",
        { href: "/login", "data-link": true },
        "Iniciar Sesión"
      )
    );
    const registerLink = createElement(
      "li",
      {},
      createElement("a", { href: "/register", "data-link": true }, "Registro")
    );
    navLinks.appendChild(loginLink);
    navLinks.appendChild(registerLink);
  }
}

// --- CONFIGURACIÓN E INICIALIZACIÓN ---

// Definimos un array de rutas base. Aún no son los componentes finales.
const routeDefinitions = [
  { path: "/", componentFactory: HomeView },
  { path: "/login", componentFactory: LoginView },
  { path: "/register", componentFactory: RegisterView },
  { path: "/profile", componentFactory: ProfileView },
  { path: "*", componentFactory: HomeView },
];

// Creamos una instancia del enrutador. Todavía no tiene las rutas finales.
const router = createRouter([]);

// Ahora, procesamos las definiciones de ruta para crear los componentes finales,
// inyectando las dependencias necesarias (como el propio router o la basePath).
const routes = routeDefinitions.map((routeDef) => {
  let component;
  // La vista de inicio necesita `basePath`.
  if (routeDef.componentFactory === HomeView) {
    component = routeDef.componentFactory(basePath);
  } else {
    // Las otras vistas necesitan la instancia del `router`.
    component = routeDef.componentFactory(router);
  }
  return { path: routeDef.path, component };
});

// Asignamos las rutas procesadas al enrutador.
router.routes = routes;

// Inicializamos el enrutador para que cargue la vista inicial.
router.init();

// Al cargar la página, verificamos si hay una sesión guardada y renderizamos la navbar.
authService.checkSession();
renderNavbar();

// Nos suscribimos a los cambios de autenticación para re-renderizar la navbar.
store.subscribe("isAuthenticated", renderNavbar);
