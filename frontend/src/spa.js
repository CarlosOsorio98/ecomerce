/**
 * @file spa.js
 * @description
 * Este archivo contiene la lógica para crear una Aplicación de Página Única (Single Page Application - SPA).
 * Una SPA es una web que no necesita recargar la página entera para cambiar de contenido.
 * Esto lo logramos con dos piezas clave:
 * 1. Un Enrutador (`Router`): Intercepta los clics en los enlaces y usa la History API del navegador
 *    para cambiar la URL sin recargar, y luego renderiza la vista correcta.
 * 2. Un Creador de Elementos (`createElement`): Una función de ayuda para construir HTML
 *    con JavaScript de una forma más limpia y segura que escribiendo strings de HTML.
 */
import { setCurrentRoute } from "./state.js";

/**
 * La clase Router maneja toda la navegación del lado del cliente.
 * Se encarga de escuchar los cambios en la URL y renderizar el componente (vista) adecuado.
 */
class Router {
  /**
   * @param {Array<object>} routes - Un array de objetos de ruta. Cada objeto debe tener `path` y `component`.
   */
  constructor(routes) {
    this.routes = routes;
    // El elemento `#app` es donde se inyectará todo el contenido de nuestras vistas.
    this.rootElement = document.getElementById("app");
    this.basePath = this.getBasePath();

    // --- MANEJO DE EVENTOS DE NAVEGACIÓN ---

    // 1. Escuchar el evento 'popstate':
    // Se dispara cuando el usuario usa los botones de "atrás" o "adelante" del navegador.
    window.addEventListener("popstate", () => this.handleRoute());

    // 2. Escuchar clics en todo el documento:
    // En lugar de añadir un listener a cada enlace, usamos la "delegación de eventos".
    // Escuchamos en un elemento padre (el `document`) y luego comprobamos si el clic
    // ocurrió en un elemento que nos interesa (un enlace con `data-link`).
    document.addEventListener("click", (e) => {
      // `e.target.closest('[data-link]')` busca el enlace `[data-link]` más cercano
      // al elemento donde se hizo clic. Esto funciona incluso si hacemos clic en un
      // ícono o texto dentro del enlace.
      const link = e.target.closest("[data-link]");
      if (link) {
        e.preventDefault(); // Evitamos que el enlace recargue la página.
        const href = link.getAttribute("href");
        this.navigateTo(href); // Usamos nuestro método para navegar.
      }
    });
  }

  /**
   * Calcula la ruta base del proyecto.
   * @returns {string} La ruta base.
   */
  getBasePath() {
    const scriptPath = document
      .querySelector('script[src*="main.js"]')
      .getAttribute("src");
    return scriptPath.substring(0, scriptPath.indexOf("src/"));
  }

  /**
   * Convierte una ruta completa del navegador a una ruta relativa a la aplicación.
   * @param {string} path - La ruta de `window.location.pathname`.
   * @returns {string} La ruta relativa normalizada (ej. "/login").
   */
  getRelativePath(path) {
    const relative = path.startsWith(this.basePath)
      ? path.slice(this.basePath.length)
      : path;
    // Nos aseguramos de que la ruta siempre empiece con un "/" y no tenga duplicados.
    return `/${relative}`.replace(/\/+/g, "/");
  }

  /**
   * El corazón del enrutador. Se llama cada vez que la ruta cambia.
   * Determina qué componente/vista mostrar basado en la URL actual.
   */
  async handleRoute() {
    let path = window.location.pathname;
    // Normalizamos la ruta para quitar el slash final si existe (ej. /about/ -> /about)
    if (path.endsWith("/") && path.length > 1) {
      path = path.slice(0, -1);
    }

    const relativePath = this.getRelativePath(path);
    // Buscamos en nuestro array de rutas una que coincida con la ruta actual.
    // Si no encuentra una, busca la ruta "comodín" (*).
    const route =
      this.routes.find((r) => r.path === relativePath) ||
      this.routes.find((r) => r.path === "*");

    if (!route) {
      console.error("Ruta no encontrada:", relativePath);
      return;
    }

    // Actualizamos el estado global con la nueva ruta.
    setCurrentRoute(relativePath);

    try {
      // Las vistas son funciones (algunas asíncronas), así que las llamamos para
      // obtener el elemento del DOM que representan.
      const view = await route.component();
      if (this.rootElement) {
        this.rootElement.innerHTML = ""; // Limpiamos el contenido anterior.
        this.rootElement.appendChild(view); // Añadimos la nueva vista.
      } else {
        console.error("Elemento raíz no encontrado");
      }
    } catch (error) {
      console.error("Error al renderizar la vista:", error);
    }
  }

  /**
   * Navega a una nueva ruta de forma programática.
   * @param {string} path - La ruta a la que se quiere navegar (ej. "/login").
   */
  navigateTo(path) {
    // Si la ruta ya es absoluta, no anteponer basePath
    let fullPath;
    if (path.startsWith("/")) {
      fullPath = path;
    } else {
      // Solo para rutas relativas (no debería ocurrir en tu app)
      const separator =
        this.basePath.endsWith("/") || this.basePath.length === 1 ? "" : "/";
      fullPath = this.basePath + separator + path;
    }
    window.history.pushState(null, null, fullPath);
    this.handleRoute();
  }

  /**
   * Inicializa el enrutador al cargar la página por primera vez.
   */
  init() {
    this.handleRoute();
  }
}

/**
 * Función de ayuda (helper) para crear elementos del DOM.
 * Es una alternativa a escribir `document.createElement`, `element.setAttribute`, etc.
 * Simplifica la creación de estructuras HTML complejas.
 *
 * @param {string} tag - La etiqueta HTML a crear (ej. 'div', 'p', 'button').
 * @param {object} props - Un objeto con propiedades y atributos para el elemento (ej. { className: 'clase', id: 'mi-id' }).
 * @param  {...any} children - Los hijos del elemento. Pueden ser otros elementos, texto, números, etc.
 * @returns {HTMLElement} El elemento del DOM creado.
 */
export function createElement(tag, props = {}, ...children) {
  const element = document.createElement(tag);

  // Asignamos las propiedades y atributos.
  Object.entries(props).forEach(([key, value]) => {
    if (key === "className") {
      element.className = value;
    } else if (key.startsWith("on") && typeof value === "function") {
      // Si la propiedad empieza con "on" (como "onclick"), la tratamos como un evento.
      element.addEventListener(key.toLowerCase().slice(2), value);
    } else {
      element.setAttribute(key, value);
    }
  });

  // Añadimos los elementos hijos.
  // `children.flat()` aplana el array por si pasamos un array de hijos.
  children.flat().forEach((child) => {
    if (child instanceof Node) {
      // Si el hijo ya es un nodo del DOM, lo añadimos directamente.
      element.appendChild(child);
    } else if (child !== null && child !== undefined) {
      // Si es texto, número, etc., creamos un nodo de texto y lo añadimos.
      element.appendChild(document.createTextNode(child));
    }
  });

  return element;
}

/**
 * Función "Factory" para crear una instancia del Router.
 * Una factory es una función que crea y devuelve objetos.
 * @param {Array<object>} routes - El array de rutas para el router.
 * @returns {Router} Una nueva instancia del enrutador.
 */
export function createRouter(routes) {
  return new Router(routes);
}
