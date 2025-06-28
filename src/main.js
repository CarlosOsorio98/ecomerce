import { createRouter, createElement } from './spa.js';
import { store, setUser, logout } from './state.js';
import { AuthService } from './services/auth.js';

// Servicios
const authService = new AuthService();

// Obtener la ruta base del proyecto
const basePath = document.querySelector('script[src*="main.js"]')
    .getAttribute('src')
    .replace('src/main.js', '');

// Vistas
async function HomeView() {
    const container = createElement('div', { className: 'products-grid' });

    try {
        const response = await fetch(basePath + 'assets.json');
        const products = await response.json();

        products.forEach(product => {
            const card = createElement('div', { className: 'product-card' },
                createElement('img', { 
                    src: basePath + product.url, 
                    alt: product.name 
                }),
                createElement('h3', {}, product.name),
                createElement('p', { className: 'price' }, `$${product.price}`),
                createElement('button', { className: 'add-to-cart' }, 'Agregar al carrito')
            );
            container.appendChild(card);
        });
    } catch (error) {
        console.error('Error cargando productos:', error);
        container.appendChild(
            createElement('p', { className: 'error-message' },
                'Error al cargar los productos. Por favor, intente más tarde.'
            )
        );
    }

    return container;
}

function LoginView() {
    const container = createElement('div', { className: 'auth-container' },
        createElement('form', {
            className: 'auth-form',
            onsubmit: async (e) => {
                e.preventDefault();
                const email = e.target.email.value;
                const password = e.target.password.value;

                try {
                    await authService.signIn(email, password);
                    router.navigateTo('/');
                } catch (error) {
                    alert(error.message);
                }
            }
        },
            createElement('h2', {}, 'Iniciar Sesión'),
            createElement('input', {
                type: 'email',
                name: 'email',
                placeholder: 'Correo electrónico',
                required: true
            }),
            createElement('input', {
                type: 'password',
                name: 'password',
                placeholder: 'Contraseña',
                required: true
            }),
            createElement('button', { type: 'submit' }, 'Ingresar')
        )
    );

    return container;
}

function RegisterView() {
    const container = createElement('div', { className: 'auth-container' },
        createElement('form', {
            className: 'auth-form',
            onsubmit: async (e) => {
                e.preventDefault();
                const name = e.target.name.value;
                const email = e.target.email.value;
                const password = e.target.password.value;
                const confirmPassword = e.target.confirmPassword.value;

                if (password !== confirmPassword) {
                    alert('Las contraseñas no coinciden');
                    return;
                }

                try {
                    await authService.signUp({ name, email, password });
                    router.navigateTo('/');
                } catch (error) {
                    alert(error.message);
                }
            }
        },
            createElement('h2', {}, 'Registro'),
            createElement('input', {
                type: 'text',
                name: 'name',
                placeholder: 'Nombre completo',
                required: true
            }),
            createElement('input', {
                type: 'email',
                name: 'email',
                placeholder: 'Correo electrónico',
                required: true
            }),
            createElement('input', {
                type: 'password',
                name: 'password',
                placeholder: 'Contraseña',
                required: true
            }),
            createElement('input', {
                type: 'password',
                name: 'confirmPassword',
                placeholder: 'Confirmar contraseña',
                required: true
            }),
            createElement('button', { type: 'submit' }, 'Registrarse')
        )
    );

    return container;
}

// Configuración de rutas
const routes = [
    { path: '/', component: HomeView },
    { path: '/login', component: LoginView },
    { path: '/register', component: RegisterView },
    { path: '*', component: HomeView } // Ruta por defecto
];

// Crear y inicializar el router
const router = createRouter(routes);
router.init();

// Verificar sesión al cargar
authService.checkSession();
