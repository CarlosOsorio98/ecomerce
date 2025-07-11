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

const closedSVG = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" style="fill: none; stroke: currentColor; stroke-width: 2;">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>`;
const trashSVG = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" style="fill: none; stroke: currentColor; stroke-width: 2;">
        <path d="M3 6h18"></path>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
        <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        <line x1="10" y1="11" x2="10" y2="17"></line>
        <line x1="14" y1="11" x2="14" y2="17"></line>
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

  const header = createElement(
    "div",
    { className: "cart-header" },
    createElement(
      "button",
      {
        className: "close-cart-button",
        onclick: toggleCartView,
        style: "background: none; border: none; cursor: pointer; padding: 8px;",
      },
      createElement("span", {
        className: "svg-icon",
        innerHTML: closedSVG,
        style: "display: inline-flex; width: 24px; height: 24px; color: #333;",
      })
    ),
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
      createElement(
        "button",
        {
          className: "remove-item-button",
          onclick: () => removeFromCart(item.id),
          style:
            "background: none; border: none; cursor: pointer; padding: 4px; display: flex; align-items: center; justify-content: center; color: #ff0000;",
        },
        createElement("span", {
          className: "svg-icon",
          innerHTML: trashSVG,
          style: "display: inline-flex; width: 24px; height: 24px;",
        })
      )
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
