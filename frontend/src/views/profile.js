/**
 * @file profile.js
 * @description La vista del perfil de usuario.
 */
import { userService } from "../services/user.js";
import { createElement } from "../spa.js";
import { getCart, getUser, addToCart, removeFromCart, syncCart } from "../state.js";

/**
 * Crea la vista del perfil de usuario.
 * @param {object} router - La instancia del enrutador.
 * @returns {Function} La función de la vista real.
 */
export function ProfileView(router) {
  return async function () {
    const user = getUser();
    // Sincronizar el carrito con la API
    await syncCart();
    const cart = getCart();
    
    const container = createElement("div", { className: "profile-container" });
    const cartSection = await createCartSection(cart, user, router);
    container.appendChild(cartSection);
    const accountSection = createAccountSection(user, router);
    container.appendChild(accountSection);
    return container;
  };
}

async function createCartSection(cart, user, router) {
  const cartSection = createElement(
    "div",
    { className: "cart-section" },
    createElement("h2", {}, `Bienvenido, ${user.name}`),
    createElement("h3", {}, "Tu Carrito de Compras")
  );

  if (!cart || cart.length === 0) {
    cartSection.appendChild(createElement("p", {}, "Tu carrito está vacío."));
  } else {
    let total = 0;
    const cartList = createElement("ul", { className: "cart-list" });
    for (const item of cart) {
      const subtotal = item.price * item.quantity;
      total += subtotal;
      const quantityControls = createElement(
        "div",
        { className: "quantity-controls" },
        createElement(
          "button",
          {
            onclick: async () => {
              await addToCart(item.asset_id, -1);
              router.handleRoute();
            },
          },
          "-"
        ),
        createElement("span", {}, item.quantity),
        createElement(
          "button",
          {
            onclick: async () => {
              await addToCart(item.asset_id, 1);
              router.handleRoute();
            },
          },
          "+"
        )
      );
      const itemDetails = createElement(
        "div",
        { className: "item-details" },
        `${item.name} ($${item.price.toFixed(2)} c/u)`
      );
      const itemSubtotal = createElement(
        "div",
        { className: "item-subtotal" },
        `Subtotal: $${subtotal.toFixed(2)}`
      );
      const removeButton = createElement(
        "button",
        {
          className: "remove-item",
          onclick: async () => {
            await removeFromCart(item.id);
            router.handleRoute();
          },
        },
        "×"
      );
      const cartItem = createElement(
        "li",
        { className: "cart-item" },
        itemDetails,
        quantityControls,
        itemSubtotal,
        removeButton
      );
      cartList.appendChild(cartItem);
    }
    const totalElement = createElement(
      "p",
      { className: "cart-total" },
      `Total: $${total.toFixed(2)}`
    );
    cartSection.appendChild(cartList);
    cartSection.appendChild(totalElement);
  }
  return cartSection;
}

function createAccountSection(user, router) {
  const accountSection = createElement("div", {
    className: "account-section auth-form",
  });

  // --- Formulario para cambiar contraseña ---
  const changePasswordForm = createElement("form", {
    className: "change-password-form",
    onsubmit: async (e) => {
      e.preventDefault();
      const currentPassword = e.target.currentPassword.value;
      const newPassword = e.target.newPassword.value;
      const confirmPassword = e.target.confirmPassword.value;

      if (newPassword !== confirmPassword) {
        alert("La nueva contraseña y la confirmación no coinciden.");
        return;
      }
      if (!newPassword || !currentPassword) {
        alert("Por favor, completa todos los campos.");
        return;
      }

      try {
        await userService.changePassword(user.id, currentPassword, newPassword);
        alert("¡Contraseña actualizada exitosamente!");
        e.target.reset(); // Limpiar el formulario
      } catch (error) {
        alert(`Error: ${error.message}`);
      }
    },
  });

  changePasswordForm.append(
    createElement("h3", {}, "Cambiar Contraseña"),
    createElement("input", {
      type: "password",
      name: "currentPassword",
      placeholder: "Contraseña Actual",
      required: true,
    }),
    createElement("input", {
      type: "password",
      name: "newPassword",
      placeholder: "Nueva Contraseña",
      required: true,
    }),
    createElement("input", {
      type: "password",
      name: "confirmPassword",
      placeholder: "Confirmar Nueva Contraseña",
      required: true,
    }),
    createElement("button", { type: "submit" }, "Actualizar Contraseña")
  );

  // --- Botón para eliminar cuenta ---
  const deleteButton = createElement(
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
  );

  accountSection.append(
    createElement("h3", {}, "Gestionar Cuenta"),
    changePasswordForm,
    deleteButton
  );

  return accountSection;
}
