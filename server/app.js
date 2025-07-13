import { getCORSHeaders } from "./cors.js";
import { db } from "./data/schema.js";
import {
  setupDatabase,
  userRegisterSchema,
  userLoginSchema,
  createUser,
  getUserByEmail,
  validateUserLogin,
  hashPassword, // <-- Importar la función de hash
} from "./data/setup.js";
import { handleAdminRoutes } from "./secret.route.js";
import {
  signJWT,
  verifyJWT,
  getCookie,
  setSessionCookie,
  clearSessionCookie,
  saveJWTToken,
  revokeJWTToken,
  isJWTRevoked,
} from "./jwt.js";

// Cargar variables de entorno desde .env
await import("dotenv/config");
// También podemos usar Bun.env para acceder a las variables de entorno
const adminKey = process.env.ADMIN_KEY || Bun.env.ADMIN_KEY;

if (!adminKey) {
  console.error(
    "ERROR: ADMIN_KEY no está definida en las variables de entorno"
  );
  process.exit(1);
}

console.log("Variables de entorno cargadas. ADMIN_KEY presente:", !!adminKey);

// Inicializar la base de datos y poblarla
setupDatabase();

// Esquema para agregar al carrito
const addToCartSchema = z.object({
  asset_id: z.string(),
  quantity: z.number().int().min(-100).max(100),
});

// Servidor Bun simple para SPA
const server = Bun.serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);

    // Rutas de administrador
    if (
      url.pathname.startsWith("/admin") ||
      url.pathname.startsWith("/api/admin")
    ) {
      return handleAdminRoutes(req);
    }

    // --- API: Listar productos ---
    if (url.pathname === "/api/assets" && req.method === "GET") {
      const assets = db.query("SELECT * FROM assets").all();
      return new Response(JSON.stringify(assets), {
        status: 200,
        headers: { ...getCORSHeaders(), "Content-Type": "application/json" },
      });
    }

    // --- API: Listar carrito ---
    if (url.pathname === "/api/cart" && req.method === "GET") {
      const cart = db
        .query(
          `
        SELECT cart.id, cart.asset_id, cart.quantity, assets.name, assets.price, assets.url
        FROM cart JOIN assets ON cart.asset_id = assets.id
      `
        )
        .all();
      return new Response(JSON.stringify(cart), {
        status: 200,
        headers: { ...getCORSHeaders(), "Content-Type": "application/json" },
      });
    }

    // --- API: Agregar producto al carrito ---
    if (url.pathname === "/api/cart" && req.method === "POST") {
      try {
        const body = await req.json();
        const parsed = addToCartSchema.safeParse(body);
        if (!parsed.success) {
          return new Response(JSON.stringify({ error: parsed.error }), {
            status: 400,
            headers: {
              ...getCORSHeaders(),
              "Content-Type": "application/json",
            },
          });
        }
        // Verificar que el asset existe
        const asset = db
          .query("SELECT * FROM assets WHERE id = ?")
          .get(body.asset_id);
        if (!asset) {
          return new Response(JSON.stringify({ error: "Producto no existe" }), {
            status: 404,
            headers: {
              ...getCORSHeaders(),
              "Content-Type": "application/json",
            },
          });
        }
        // Si ya está en el carrito, suma la cantidad
        const existing = db
          .query("SELECT * FROM cart WHERE asset_id = ?")
          .get(body.asset_id);
        if (existing) {
          const newQuantity = existing.quantity + body.quantity;
          if (newQuantity <= 0) {
            // Si la cantidad resultante es 0 o menos, eliminar el item
            db.run("DELETE FROM cart WHERE asset_id = ?", [body.asset_id]);
          } else {
            // Actualizar la cantidad
            db.run("UPDATE cart SET quantity = ? WHERE asset_id = ?", [
              newQuantity,
              body.asset_id,
            ]);
          }
        } else {
          // Solo insertar si la cantidad es positiva
          if (body.quantity > 0) {
            db.run("INSERT INTO cart (asset_id, quantity) VALUES (?, ?)", [
              body.asset_id,
              body.quantity,
            ]);
          }
        }
        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { ...getCORSHeaders(), "Content-Type": "application/json" },
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: "Bad Request" }), {
          status: 400,
          headers: { ...getCORSHeaders(), "Content-Type": "application/json" },
        });
      }
    }

    // --- API: Eliminar producto del carrito ---
    if (url.pathname.startsWith("/api/cart/") && req.method === "DELETE") {
      const id = url.pathname.split("/").pop();
      db.run("DELETE FROM cart WHERE id = ?", [id]);
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { ...getCORSHeaders(), "Content-Type": "application/json" },
      });
    }

    // --- API: Registro de usuario ---
    if (url.pathname === "/api/register" && req.method === "POST") {
      try {
        const body = await req.json();
        const parsed = userRegisterSchema.safeParse(body);
        if (!parsed.success) {
          const errorMsg =
            parsed.error.errors?.map((e) => e.message).join(", ") ||
            "Error de validación";
          return new Response(JSON.stringify({ error: errorMsg }), {
            status: 400,
            headers: {
              ...getCORSHeaders(),
              "Content-Type": "application/json",
            },
          });
        }
        if (getUserByEmail(body.email)) {
          return new Response(
            JSON.stringify({ error: "Email ya registrado" }),
            {
              status: 409,
              headers: {
                ...getCORSHeaders(),
                "Content-Type": "application/json",
              },
            }
          );
        }
        const user = createUser(body);
        return new Response(JSON.stringify(user), {
          status: 201,
          headers: { ...getCORSHeaders(), "Content-Type": "application/json" },
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: "Error en registro" }), {
          status: 400,
          headers: { ...getCORSHeaders(), "Content-Type": "application/json" },
        });
      }
    }

    // --- API: Login de usuario ---
    if (url.pathname === "/api/login" && req.method === "POST") {
      try {
        const body = await req.json();
        const user = getUserByEmail(body.email);
        const hashed = hashPassword(body.password);
        if (!user) {
          console.log("[LOGIN] Usuario no encontrado:", body.email);
        } else {
          console.log("[LOGIN] Hash recibido:", hashed);
          console.log("[LOGIN] Hash guardado:", user.password);
        }
        const parsed = userLoginSchema.safeParse(body);
        if (!parsed.success) {
          const errorMsg =
            parsed.error.errors?.map((e) => e.message).join(", ") ||
            "Error de validación";
          return new Response(JSON.stringify({ error: errorMsg }), {
            status: 400,
            headers: {
              ...getCORSHeaders(),
              "Content-Type": "application/json",
            },
          });
        }
        const validUser = validateUserLogin(body.email, body.password);
        if (!validUser) {
          return new Response(
            JSON.stringify({ error: "Credenciales inválidas" }),
            {
              status: 401,
              headers: {
                ...getCORSHeaders(),
                "Content-Type": "application/json",
              },
            }
          );
        }

        const token = signJWT({ id: validUser.id, email: validUser.email });
        console.log("[LOGIN] Token generado:", token ? "sí" : "no");

        saveJWTToken(validUser.id, token);
        console.log("[LOGIN] Token guardado en BD");

        const cookieValue = setSessionCookie(token);
        console.log("[LOGIN] Cookie configurada:", cookieValue);

        return new Response(JSON.stringify(validUser), {
          status: 200,
          headers: {
            ...getCORSHeaders(),
            "Content-Type": "application/json",
            "Set-Cookie": cookieValue,
          },
        });
      } catch (e) {
        console.error("[LOGIN] Error inesperado:", e);
        return new Response(JSON.stringify({ error: "Error en login" }), {
          status: 400,
          headers: { ...getCORSHeaders(), "Content-Type": "application/json" },
        });
      }
    }

    // --- API: Obtener sesión actual ---
    if (url.pathname === "/api/session" && req.method === "GET") {
      const cookies = req.headers.get("cookie");
      console.log("[SESSION] Cookies recibidas:", cookies);

      const token = getCookie(req, "session");
      console.log("[SESSION] Token extraído:", token ? "presente" : "ausente");

      if (!token) {
        console.log("[SESSION] No hay token de sesión");
        return new Response(JSON.stringify({ error: "No autenticado" }), {
          status: 401,
          headers: { ...getCORSHeaders(), "Content-Type": "application/json" },
        });
      }

      const payload = verifyJWT(token);
      console.log("[SESSION] Payload JWT:", payload ? "válido" : "inválido");

      if (!payload || isJWTRevoked(token)) {
        console.log("[SESSION] Token inválido o revocado");
        return new Response(
          JSON.stringify({ error: "Token inválido o revocado" }),
          {
            status: 401,
            headers: {
              ...getCORSHeaders(),
              "Content-Type": "application/json",
            },
          }
        );
      }

      const user = db
        .query("SELECT id, name, email, created_at FROM users WHERE id = ?")
        .get(payload.id);

      if (!user) {
        console.log("[SESSION] Usuario no encontrado en BD");
        return new Response(
          JSON.stringify({ error: "Usuario no encontrado" }),
          {
            status: 404,
            headers: {
              ...getCORSHeaders(),
              "Content-Type": "application/json",
            },
          }
        );
      }

      console.log("[SESSION] Usuario encontrado:", user.email);
      return new Response(JSON.stringify(user), {
        status: 200,
        headers: { ...getCORSHeaders(), "Content-Type": "application/json" },
      });
    }

    // --- API: Logout ---
    if (url.pathname === "/api/logout" && req.method === "POST") {
      const token = getCookie(req, "session");
      if (token) {
        revokeJWTToken(token); // Marcar como revocado
      }
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: {
          ...getCORSHeaders(),
          "Content-Type": "application/json",
          "Set-Cookie": clearSessionCookie(),
        },
      });
    }

    // Manejo de preflight OPTIONS
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: getCORSHeaders(),
      });
    }
    let filePath = decodeURIComponent(url.pathname);
    if (filePath === "/" || filePath === "") filePath = "/index.html";
    try {
      // Intenta servir el archivo solicitado
      const file = Bun.file(`.${filePath}`);
      if (await file.exists()) {
        return new Response(file, {
          headers: getCORSHeaders(),
        });
      }
      // Si no existe, sirve index.html (SPA fallback)
      const indexFile = Bun.file("./frontend/index.html");
      return new Response(indexFile, {
        headers: { ...getCORSHeaders(), "Content-Type": "text/html" },
      });
    } catch (e) {
      return new Response("404 Not Found", {
        status: 404,
        headers: getCORSHeaders(),
      });
    }
  },
});

console.log("Servidor corriendo en http://localhost:3000");
