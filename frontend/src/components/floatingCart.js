/**
 * @file floatingCart.js
 * @description
 * Componente de carrito flotante que muestra el número de items y permite ver/gestionar el carrito.
 */
import { createElement } from "../spa.js";
import {
  store,
  getCart,
  updateCartItemQuantity,
  removeFromCart,
  syncCart,
} from "../state.js";

let isCartOpen = false;
let cartOverlay = null;
let cartItemsContainer = null; // Keep a reference to the items container

const closedSVG = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const trashSVG = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M10 12L14 16M14 12L10 16M4 6H20M16 6L15.7294 5.18807C15.4671 4.40125 15.3359 4.00784 15.0927 3.71698C14.8779 3.46013 14.6021 3.26132 14.2905 3.13878C13.9376 3 13.523 3 12.6936 3H11.3064C10.477 3 10.0624 3 9.70951 3.13878C9.39792 3.26132 9.12208 3.46013 8.90729 3.71698C8.66405 4.00784 8.53292 4.40125 8.27064 5.18807L8 6M18 6V16.2C18 17.8802 18 18.7202 17.673 19.362C17.3854 19.9265 16.9265 20.3854 16.362 20.673C15.7202 21 14.8802 21 13.2 21H10.8C9.11984 21 8.27976 21 7.63803 20.673C7.07354 20.3854 6.6146 19.9265 6.32698 19.362C6 18.7202 6 17.8802 6 16.2V6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

// Subscribe to cart changes to re-render items list whenever the state updates
// This subscription is now outside createCartOverlay to be active earlier
store.subscribe("cart", (cart) => {
  console.log("[FloatingCart] Cart state updated.", cart); // Log state update
  // Update the count on the button
  const countElement = document.getElementById("cart-count");
  if (countElement) {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    countElement.textContent = totalItems.toString();
    // Optional: añadir clase para animar cuando cambia el número
    countElement.classList.add("updated");
    setTimeout(() => {
      countElement.classList.remove("updated");
    }, 300); // Remover la clase después de una pequeña animación
  }

  // If the cart items container exists (sidebar has been opened), re-render the list
  if (cartItemsContainer) {
    try {
      renderCartItems(cartItemsContainer);
      console.log("[FloatingCart] Cart items re-rendered."); // Log successful re-render
    } catch (error) {
      console.error("[FloatingCart] Error rendering cart items:", error); // Log errors during rendering
    }
  } else {
    console.log(
      "[FloatingCart] Cart state updated, but sidebar not open. Not rendering items."
    ); // Log when not rendering
  }
});

/**
 * Crea el elemento del icono flotante del carrito.
 * @returns {HTMLElement} El elemento del botón flotante.
 */
function createFloatingCartButton() {
  const button = createElement(
    "button",
    {
      id: "floating-cart-button",
      className: "floating-cart-button",
      onclick: toggleCartView,
    },
    createElement("span", { className: "cart-icon" }, "🛒"), // Icono de carrito
    createElement("span", { id: "cart-count", className: "cart-count" }, "0") // Contador de items
  );

  // The subscription for count is now handled by the global one above

  return button;
}

/**
 * Crea el overlay y el contenido del modal/sidebar del carrito.
 * @returns {HTMLElement} El elemento del overlay del carrito.
 */
function createCartOverlay() {
  cartOverlay = createElement("div", { className: "cart-overlay" });
  const cartContent = createElement("div", { className: "cart-content" });

  const closeButton = createElement("button", {
    className: "close-cart-button",
    onclick: toggleCartView,
  });
  closeButton.innerHTML = closedSVG;

  const header = createElement(
    "div",
    { className: "cart-header" },
    closeButton,
    createElement("h2", {}, "Tu Carrito")
  );

  cartItemsContainer = createElement("div", { className: "cart-items" }); // Assign to the global variable
  cartContent.appendChild(header);
  cartContent.appendChild(cartItemsContainer);

  // Initial render when the overlay is created
  renderCartItems(cartItemsContainer);

  // The subscription for rendering is now handled by the global one outside

  cartOverlay.appendChild(cartContent);
  // Añadir listener para cerrar al hacer clic fuera del contenido
  cartOverlay.addEventListener("click", (e) => {
    if (e.target === cartOverlay) {
      toggleCartView();
    }
  });

  return cartOverlay;
}

/**
 * Renderiza la lista de items dentro del contenedor del carrito.
 * @param {HTMLElement} container - El contenedor donde se renderizarán los items.
 */
function renderCartItems(container) {
  console.log("[FloatingCart] Rendering cart items..."); // Log start of rendering
  container.innerHTML = ""; // Limpiar contenido actual
  const cart = getCart();

  if (!cart || cart.length === 0) {
    container.appendChild(createElement("p", {}, "El carrito está vacío."));
    return;
  }

  cart.forEach((item) => {
    const itemElement = createElement(
      "div",
      { className: "cart-item" },
      createElement("img", {
        src: item.url,
        alt: item.name,
        className: "cart-item-image",
      }),
      createElement(
        "div",
        { className: "cart-item-details" },
        createElement("h4", {}, item.name),
        createElement("p", {}, `$${item.price.toFixed(2)} c/u`),
        createElement(
          "div",
          { className: "cart-item-quantity-control" },
          createElement(
            "button",
            {
              onclick: () =>
                updateCartItemQuantity(item.asset_id, item.quantity - 1),
              disabled: item.quantity <= 1,
            },
            "-"
          ),
          createElement("span", {}, item.quantity),
          createElement(
            "button",
            {
              onclick: () =>
                updateCartItemQuantity(item.asset_id, item.quantity + 1),
            },
            "+"
          )
        )
      ),
      (() => {
        const removeButton = createElement("button", {
          className: "remove-item-button",
          onclick: () => removeFromCart(item.asset_id),
        });
        removeButton.innerHTML = trashSVG;
        return removeButton;
      })()
    );
    container.appendChild(itemElement);
  });

  // Calcular y mostrar total
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalElement = createElement(
    "div",
    { className: "cart-total" },
    createElement("h3", {}, "Total:"),
    createElement("span", {}, `$${total.toFixed(2)}`)
  );
  container.appendChild(totalElement);
}

/**
 * Alterna la visibilidad del overlay del carrito.
 */
function toggleCartView() {
  if (!cartOverlay) {
    cartOverlay = createCartOverlay();
    document.body.appendChild(cartOverlay);
    console.log("[FloatingCart] Cart overlay created and added to body."); // Log creation
  }

  isCartOpen = !isCartOpen;
  if (isCartOpen) {
    cartOverlay.classList.add("open");
    console.log("[FloatingCart] Cart sidebar opened."); // Log opening
    // The rendering is now handled by the global subscription
  } else {
    cartOverlay.classList.remove("open");
    console.log("[FloatingCart] Cart sidebar closed."); // Log closing
  }
}

/**
 * Inicializa el componente del carrito flotante.
 * Crea el botón y lo añade al DOM.
 */
export function initFloatingCart() {
  const floatingButton = createFloatingCartButton();
  document.body.appendChild(floatingButton);
  // Sincronizar el carrito al iniciar la app
  syncCart();
}
