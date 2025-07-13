// Utilidades para autenticación de administrador
export function getAdminKey() {
  return (
    process.env.ADMIN_KEY ||
    (typeof Bun !== "undefined" && Bun.env.ADMIN_KEY) ||
    "admin"
  );
}

export function requireAdmin(req) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return false;
  }
  const token = authHeader.split(" ")[1];
  const adminKey = getAdminKey();
  return token === adminKey;
}
