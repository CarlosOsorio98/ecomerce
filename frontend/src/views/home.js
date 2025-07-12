/**
 * @file home.js
 * @description La vista de la página de inicio.
 */

import { showQuantityModal } from "../components/modal.js";
import { createElement } from "../spa.js";

/**
 * Crea la vista de la página de inicio.
 * @param {string} basePath - La ruta base del proyecto para cargar assets.
 * @returns {Function} La función de la vista real.
 */
export function HomeView() {
  return async function () {
    const container = createElement("div", { className: "products-grid" });

    try {
      // Consumir la API de productos
      const response = await fetch("/api/assets");
      const products = await response.json();

      products.forEach((product) => {
        // Si la url ya empieza con /assets o http, no anteponer nada
        const imgSrc =
          product.url.startsWith("/") || product.url.startsWith("http")
            ? product.url
            : "/frontend/" + product.url;
        const card = createElement(
          "div",
          { className: "product-card" },
          createElement("img", {
            src: imgSrc,
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
  };
}
