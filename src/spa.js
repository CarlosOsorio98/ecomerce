import { setCurrentRoute } from "./state.js";

class Router {
  constructor(routes) {
    this.routes = routes;
    this.rootElement = document.getElementById("app");
    this.basePath = this.getBasePath();

    // Manejar navegación
    window.addEventListener("popstate", () => this.handleRoute());
    document.addEventListener("click", (e) => {
      const link = e.target.closest("[data-link]");
      if (link) {
        e.preventDefault();
        const href = link.getAttribute("href");
        this.navigateTo(href);
      }
    });
  }

  getBasePath() {
    const scriptPath = document
      .querySelector('script[src*="main.js"]')
      .getAttribute("src");
    return scriptPath.substring(0, scriptPath.indexOf("src/"));
  }

  getRelativePath(path) {
    const relative = path.startsWith(this.basePath)
      ? path.slice(this.basePath.length)
      : path;
    // Asegurarse de que la ruta siempre empiece con / y no esté vacía
    return `/${relative}`.replace(/\/+/g, "/");
  }

  async handleRoute() {
    let path = window.location.pathname;
    // Para la ruta raíz, window.location.pathname puede o no tener el slash al final
    if (path.endsWith("/") && path.length > 1) {
      path = path.slice(0, -1);
    }

    const relativePath = this.getRelativePath(path);
    const route =
      this.routes.find((r) => r.path === relativePath) ||
      this.routes.find((r) => r.path === "*");

    if (!route) {
      console.error("Ruta no encontrada:", relativePath);
      return;
    }

    // Actualizar estado global
    setCurrentRoute(relativePath);

    try {
      // Renderizar vista
      const view = await route.component();
      if (this.rootElement) {
        this.rootElement.innerHTML = "";
        this.rootElement.appendChild(view);
      } else {
        console.error("Elemento raíz no encontrado");
      }
    } catch (error) {
      console.error("Error al renderizar la vista:", error);
    }
  }

  navigateTo(path) {
    // Asegurarse de que el basePath termina en / si no es solo /
    const separator =
      this.basePath.endsWith("/") || this.basePath.length === 1 ? "" : "/";
    const cleanPath = path.startsWith("/") ? path.slice(1) : path;
    const fullPath = this.basePath + separator + cleanPath;

    window.history.pushState(null, null, fullPath);
    this.handleRoute();
  }

  init() {
    this.handleRoute();
  }
}

// Función auxiliar para crear elementos
export function createElement(tag, props = {}, ...children) {
  const element = document.createElement(tag);

  // Aplicar propiedades
  Object.entries(props).forEach(([key, value]) => {
    if (key === "className") {
      element.className = value;
    } else if (key.startsWith("on") && typeof value === "function") {
      element.addEventListener(key.toLowerCase().slice(2), value);
    } else {
      element.setAttribute(key, value);
    }
  });

  // Agregar hijos
  children.flat().forEach((child) => {
    if (child instanceof Node) {
      element.appendChild(child);
    } else if (child !== null && child !== undefined) {
      element.appendChild(document.createTextNode(child));
    }
  });

  return element;
}

// Exportar función para crear el router
export function createRouter(routes) {
  return new Router(routes);
}
