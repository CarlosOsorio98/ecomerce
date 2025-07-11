/**
 * @file register.js
 * @description La vista para registrar un nuevo usuario.
 */
import { authService } from "../services/auth.js";
import { createElement } from "../spa.js";

/**
 * Crea la vista de registro.
 * @param {object} router - La instancia del enrutador para navegar.
 * @returns {Function} La función de la vista real.
 */
export function RegisterView(router) {
  return function () {
    return createElement(
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
              let msg = error;
              if (msg && typeof msg === "object") {
                if (msg.error) msg = msg.error;
                else if (msg.message) msg = msg.message;
                else msg = JSON.stringify(msg);
              }
              alert(msg);
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
  };
}
