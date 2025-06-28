import { setCurrentRoute } from './state.js';

class Router {
    constructor(routes) {
        this.routes = routes;
        this.rootElement = document.getElementById('app');
        this.basePath = this.getBasePath();
        
        // Manejar navegación
        window.addEventListener('popstate', () => this.handleRoute());
        document.addEventListener('click', e => {
            const link = e.target.closest('[data-link]');
            if (link) {
                e.preventDefault();
                const href = link.getAttribute('href');
                this.navigateTo(href);
            }
        });
    }

    getBasePath() {
        const scriptPath = document.querySelector('script[src*="main.js"]').getAttribute('src');
        return scriptPath.substring(0, scriptPath.indexOf('src/'));
    }

    getRelativePath(path) {
        // Eliminar el basePath del inicio de la ruta si existe
        return path.startsWith(this.basePath) ? path.slice(this.basePath.length) : path;
    }

    async handleRoute() {
        const fullPath = window.location.pathname;
        const path = this.getRelativePath(fullPath);
        const route = this.routes.find(route => route.path === path) || this.routes.find(route => route.path === '*');

        if (!route) {
            console.error('Ruta no encontrada:', path);
            return;
        }

        // Actualizar estado global
        setCurrentRoute(path);

        try {
            // Renderizar vista
            const view = await route.component();
            if (this.rootElement) {
                this.rootElement.innerHTML = '';
                this.rootElement.appendChild(view);
            } else {
                console.error('Elemento raíz no encontrado');
            }
        } catch (error) {
            console.error('Error al renderizar la vista:', error);
        }
    }

    navigateTo(path) {
        const fullPath = path.startsWith('/') ? this.basePath + path.slice(1) : this.basePath + path;
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
        if (key === 'className') {
            element.className = value;
        } else if (key.startsWith('on') && typeof value === 'function') {
            element.addEventListener(key.toLowerCase().slice(2), value);
        } else {
            element.setAttribute(key, value);
        }
    });

    // Agregar hijos
    children.flat().forEach(child => {
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