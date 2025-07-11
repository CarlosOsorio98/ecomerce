// Utilidades para JWT y cookies seguras
import jwt from "jsonwebtoken";
import { db } from "./data/schema.js";

const JWT_SECRET = process.env.JWT_SECRET || "ecomerce_jwt_secrec";
const JWT_EXPIRES_IN = "7d"; // 7 días

export function signJWT(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyJWT(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (e) {
    return null;
  }
}

export function getCookie(req, name) {
  const cookie = req.headers.get("cookie");
  if (!cookie) return null;
  const cookies = Object.fromEntries(
    cookie.split(";").map((c) => {
      const [k, ...v] = c.trim().split("=");
      return [k, decodeURIComponent(v.join("="))];
    })
  );
  return cookies[name] || null;
}

export function setSessionCookie(token) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800${secure}`;
}

export function clearSessionCookie() {
  return `session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

export function saveJWTToken(user_id, token) {
  db.run(`INSERT INTO jwt_tokens (user_id, token) VALUES (?, ?)`, [
    user_id,
    token,
  ]);
}

export function revokeJWTToken(token) {
  db.run(`UPDATE jwt_tokens SET revoked = 1 WHERE token = ?`, [token]);
}

export function isJWTRevoked(token) {
  const row = db
    .query(`SELECT revoked FROM jwt_tokens WHERE token = ?`)
    .get(token);
  return row ? !!row.revoked : false;
}
