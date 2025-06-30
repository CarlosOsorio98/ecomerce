// Servidor Bun simple para SPA
const server = Bun.serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);
    // --- API para loggear acciones del carrito ---
    if (url.pathname === "/api/log-cart-action" && req.method === "POST") {
      try {
        const body = await req.json();
        console.log("[LOG CARRITO]", body);
        return new Response('{"ok":true}', {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      } catch (e) {
        return new Response('{"error":"Bad Request"}', {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }
    }
    let filePath = decodeURIComponent(url.pathname);
    if (filePath === "/" || filePath === "") filePath = "/index.html";
    try {
      // Intenta servir el archivo solicitado
      const file = Bun.file(`.${filePath}`);
      if (await file.exists()) {
        return new Response(file);
      }
      // Si no existe, sirve index.html (SPA fallback)
      const indexFile = Bun.file("./index.html");
      return new Response(indexFile, {
        headers: { "Content-Type": "text/html" },
      });
    } catch (e) {
      return new Response("404 Not Found", { status: 404 });
    }
  },
});

console.log("Servidor corriendo en http://localhost:3000");
