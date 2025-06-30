/**
 * @file modal.js
 * @description
 * Componente que contiene la lógica para mostrar un modal de selección de cantidad.
 */
import { createElement } from "../spa.js";
import { addToCart } from "../state.js";

/**
 * Muestra un modal para que el usuario elija la cantidad de un producto.
 * @param {object} product - El objeto del producto que se va a agregar.
 */
export function showQuantityModal(product) {
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
