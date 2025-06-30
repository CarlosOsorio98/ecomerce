import { AuthService } from "./services/auth.js";
import { UserService } from "./services/user.js";
import { createElement, createRouter } from "./spa.js";
import { addToCart, getCart, getUser, store } from "./state.js";

// Servicios
const authService = new AuthService();
const userService = new UserService();

// Obtener la ruta base del proyecto
const basePath = document
  .querySelector('script[src*="main.js"]')
  .getAttribute("src")
  .replace("src/main.js", "");

// Vistas
async function HomeView() {
  const container = createElement("div", { className: "products-grid" });

  try {
    const response = await fetch(basePath + "assets.json");
    const products = await response.json();

    products.forEach((product) => {
      const card = createElement(
        "div",
        { className: "product-card" },
        createElement("img", {
          src: basePath + product.url,
          alt: product.name,
        }),
        createElement("h3", {}, product.name),
        createElement("p", { className: "price" }, `$${product.price}`),
        createElement(
          "button",
          {
            className: "add-to-cart",
            onclick: () => showQuantityModal(product),
          },
          "Agregar al carrito"
        )
      );
      container.appendChild(card);
    });
  } catch (error) {
    console.error("Error cargando productos:", error);
    container.appendChild(
      createElement(
        "p",
        { className: "error-message" },
        "Error al cargar los productos. Por favor, intente más tarde."
      )
    );
  }

  return container;
}

function LoginView() {
  const container = createElement(
    "div",
    { className: "auth-container" },
    createElement(
      "form",
      {
        className: "auth-form",
        onsubmit: async (e) => {
          e.preventDefault();
          const email = e.target.email.value;
          const password = e.target.password.value;

          try {
            await authService.signIn(email, password);
            router.navigateTo("/");
          } catch (error) {
            alert(error.message);
          }
        },
      },
      createElement("h2", {}, "Iniciar Sesión"),
      createElement("input", {
        type: "email",
        name: "email",
        placeholder: "Correo electrónico",
        required: true,
      }),
      createElement("input", {
        type: "password",
        name: "password",
        placeholder: "Contraseña",
        required: true,
      }),
      createElement("button", { type: "submit" }, "Ingresar")
    )
  );

  return container;
}

function RegisterView() {
  const container = createElement(
    "div",
    { className: "auth-container" },
    createElement(
      "form",
      {
        className: "auth-form",
        onsubmit: async (e) => {
          e.preventDefault();
          const name = e.target.name.value;
          const email = e.target.email.value;
          const password = e.target.password.value;
          const confirmPassword = e.target.confirmPassword.value;

          if (password !== confirmPassword) {
            alert("Las contraseñas no coinciden");
            return;
          }

          try {
            await authService.signUp({ name, email, password });
            router.navigateTo("/login");
          } catch (error) {
            alert(error.message);
          }
        },
      },
      createElement("h2", {}, "Registro"),
      createElement("input", {
        type: "text",
        name: "name",
        placeholder: "Nombre completo",
        required: true,
      }),
      createElement("input", {
        type: "email",
        name: "email",
        placeholder: "Correo electrónico",
        required: true,
      }),
      createElement("input", {
        type: "password",
        name: "password",
        placeholder: "Contraseña",
        required: true,
      }),
      createElement("input", {
        type: "password",
        name: "confirmPassword",
        placeholder: "Confirmar contraseña",
        required: true,
      }),
      createElement("button", { type: "submit" }, "Registrarse")
    )
  );

  return container;
}

function ProfileView() {
  const user = getUser();
  const cart = getCart();

  const container = createElement("div", { className: "profile-container" });

  // Sección de bienvenida y carrito
  const welcomeSection = createElement(
    "div",
    { className: "cart-section" },
    createElement("h2", {}, `Bienvenido, ${user.name}`),
    createElement("h3", {}, "Tu Carrito de Compras")
  );

  if (cart.length === 0) {
    welcomeSection.appendChild(
      createElement("p", {}, "Tu carrito está vacío.")
    );
  } else {
    let total = 0;
    const cartList = createElement("ul", { className: "cart-list" });

    cart.forEach((item) => {
      const subtotal = item.price * item.quantity;
      total += subtotal;
      const cartItem = createElement(
        "li",
        { className: "cart-item" },
        `${item.name} - Cantidad: ${
          item.quantity
        } - Subtotal: $${subtotal.toFixed(2)}`
      );
      cartList.appendChild(cartItem);
    });

    const totalElement = createElement(
      "p",
      { className: "cart-total" },
      `Total: $${total.toFixed(2)}`
    );

    welcomeSection.appendChild(cartList);
    welcomeSection.appendChild(totalElement);
  }

  container.appendChild(welcomeSection);

  // Sección de gestión de cuenta
  const accountSection = createElement(
    "div",
    { className: "account-section auth-form" },
    createElement("h3", {}, "Gestionar Cuenta"),
    createElement(
      "button",
      {
        className: "delete-account",
        onclick: async () => {
          const password = prompt(
            "Para eliminar tu cuenta, por favor, introduce tu contraseña:"
          );
          if (password === null) return;

          try {
            await userService.deleteAccount(user.id, password);
            alert("Cuenta eliminada exitosamente.");
            router.navigateTo("/");
          } catch (error) {
            alert(`Error: ${error.message}`);
          }
        },
      },
      "Eliminar cuenta"
    )
  );

  container.appendChild(accountSection);

  return container;
}

function showQuantityModal(product) {
  const modalOverlay = createElement("div", { className: "modal-overlay" });
  const modalContent = createElement("div", { className: "modal-content" });

  let quantity = 1;
  let totalPrice = product.price;

  const title = createElement("h2", {}, `Agregar ${product.name}`);
  const quantityLabel = createElement("p", {}, "Cantidad:");
  const quantityInput = createElement("input", {
    type: "number",
    value: quantity,
    min: 1,
    oninput: (e) => {
      quantity = parseInt(e.target.value, 10);
      if (isNaN(quantity) || quantity < 1) {
        quantity = 1;
      }
      totalPrice = product.price * quantity;
      priceDisplay.textContent = `Precio Total: $${totalPrice.toFixed(2)}`;
    },
  });
  const priceDisplay = createElement(
    "p",
    {},
    `Precio Total: $${totalPrice.toFixed(2)}`
  );

  const actions = createElement("div", { className: "modal-actions" });
  const addButton = createElement(
    "button",
    {
      className: "btn-primary",
      onclick: () => {
        addToCart(product, quantity);
        document.body.removeChild(modalOverlay);
      },
    },
    "Agregar"
  );

  const cancelButton = createElement(
    "button",
    {
      className: "btn-secondary",
      onclick: () => document.body.removeChild(modalOverlay),
    },
    "Cancelar"
  );

  actions.append(cancelButton, addButton);
  modalContent.append(
    title,
    quantityLabel,
    quantityInput,
    priceDisplay,
    actions
  );
  modalOverlay.appendChild(modalContent);
  document.body.appendChild(modalOverlay);
}

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

// Configuración de rutas
const routes = [
  { path: "/", component: HomeView },
  { path: "/login", component: LoginView },
  { path: "/register", component: RegisterView },
  { path: "/profile", component: ProfileView },
  { path: "*", component: HomeView }, // Ruta por defecto
];

// Crear y inicializar el router
const router = createRouter(routes);
router.init();

// Verificar sesión al cargar y renderizar navbar
authService.checkSession();
renderNavbar();

// Suscribirse a los cambios de autenticación para re-renderizar la navbar
store.subscribe("isAuthenticated", renderNavbar);
