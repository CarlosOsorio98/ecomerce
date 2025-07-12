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

const plusAndMinus = (quantityInput) => {
  return createElement("div", { className: "plus-and-minus" }, [
    createElement("button", { className: "minus-button",
      onclick: () => {
        const input = document.getElementById("quantity-input");
        let currentValue = parseInt(input.value, 10);
        if (currentValue > 1) {
          input.value = currentValue - 1;
          input.dispatchEvent(new Event('input', { bubbles: true }));
        }
      },
     }, "-"),
    quantityInput,
    createElement("button", { className: "plus-button",
      onclick: () => {
        const input = document.getElementById("quantity-input");
        let currentValue = parseInt(input.value, 10);
        input.value = currentValue + 1;
        input.dispatchEvent(new Event('input', { bubbles: true }));
      },
     }, "+"),
  ]);
};

export function showQuantityModal(product) {
  const modalOverlay = createElement("div", { className: "modal-overlay" });
  const modalContent = createElement("div", { className: "modal-content" });

  let quantity = 1;
  let totalPrice = product.price;

  const title = createElement("h2", {}, `Agregar ${product.name}`);
  const quantityLabel = createElement("p", {}, "Cantidad:");
  const quantityInput = createElement("input", {
    id: "quantity-input",
    type: "number",
    value: quantity,
    min: 1,
    oninput: (e) => {
      quantity = parseInt(e.target.value, 10);
      if (isNaN(quantity) || quantity < 1) {
        quantity = 1;
        e.target.value = 1;
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
      onclick: async () => {
        try {
          await addToCart(product.id, quantity);
          // Opcional: mostrar feedback
        } catch (e) {
          alert("Error al agregar al carrito");
        }
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

  actions.appendChild(addButton);
  actions.appendChild(cancelButton);

  modalContent.appendChild(title);
  modalContent.appendChild(quantityLabel);
  modalContent.appendChild(plusAndMinus(quantityInput));
  modalContent.appendChild(priceDisplay);
  modalContent.appendChild(actions);

  modalOverlay.appendChild(modalContent);
  document.body.appendChild(modalOverlay);
}
