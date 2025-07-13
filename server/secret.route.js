//En este archivo se debe de configurar la ruta de un panel basico de administrador
//Se usara el template admin.html
//Al principio pedira una contraseña que es igual al .env ADMIN_KEY
//Esto es para servir un panel de administrador donde se pueda añadir y quitar productos, recuerda que las imagenes se deben guardar en frontend/assets
//El servidor debe de convertir las imagenes a WEBP y guardarlas en el mismo directorio(solo se deben de conservar las WEBP)
//Cuando el trabajo este echo modifica assets.json

import { Database } from "bun:sqlite";
import { getCORSHeaders } from "./cors.js";
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const db = new Database("server/data/db.sqlite");
const ASSETS_JSON_PATH = "frontend/assets.json";
const ASSETS_DIR = "frontend/assets";

// Middleware para verificar la contraseña de admin
function requireAdmin(req) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("[Auth] No authorization header");
    return false;
  }
  const token = authHeader.split(" ")[1];
  const adminKey = process.env.ADMIN_KEY || Bun.env.ADMIN_KEY;
  console.log("[Auth] Token recibido:", token);
  console.log("[Auth] ADMIN_KEY:", adminKey);
  return token === adminKey;
}

// Función para procesar y guardar imagen en WebP
async function processAndSaveImage(file, filename) {
  const webpFilename = filename.replace(/\.[^/.]+$/, "") + ".webp";
  const outputPath = path.join(ASSETS_DIR, webpFilename);

  await sharp(await file.arrayBuffer())
    .webp({ quality: 80 })
    .toFile(outputPath);

  return `assets/${webpFilename}`;
}

// Función para actualizar assets.json
function updateAssetsJson(assets) {
  fs.writeFileSync(ASSETS_JSON_PATH, JSON.stringify(assets, null, 2));
}

// Función para servir el panel de admin
export async function handleAdminRoutes(req) {
  const url = new URL(req.url);

  // Servir el template HTML
  if (url.pathname === "/admin" && req.method === "GET") {
    const template = Bun.file("server/templates/admin.html");
    return new Response(template, {
      headers: { ...getCORSHeaders(), "Content-Type": "text/html" },
    });
  }

  // Verificar autenticación para rutas protegidas
  if (!requireAdmin(req)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...getCORSHeaders(), "Content-Type": "application/json" },
    });
  }

  // Listar productos
  if (url.pathname === "/api/admin/products" && req.method === "GET") {
    const assets = JSON.parse(fs.readFileSync(ASSETS_JSON_PATH, "utf-8"));
    return new Response(JSON.stringify(assets), {
      headers: { ...getCORSHeaders(), "Content-Type": "application/json" },
    });
  }

  // Añadir producto
  if (url.pathname === "/api/admin/products" && req.method === "POST") {
    try {
      const formData = await req.formData();
      const name = formData.get("name");
      const price = parseFloat(formData.get("price"));
      const imageFile = formData.get("image");

      if (!name || !price || !imageFile) {
        throw new Error("Missing required fields");
      }

      // Procesar y guardar imagen
      const imageUrl = await processAndSaveImage(imageFile, imageFile.name);

      // Leer assets existentes
      const assets = JSON.parse(fs.readFileSync(ASSETS_JSON_PATH, "utf-8"));

      // Generar nuevo ID
      const newId = Math.max(...assets.map((a) => parseInt(a.id))) + 1;

      // Añadir nuevo producto
      const newProduct = {
        id: newId.toString(),
        name,
        url: imageUrl,
        price,
      };

      assets.push(newProduct);
      updateAssetsJson(assets);

      return new Response(JSON.stringify(newProduct), {
        status: 201,
        headers: { ...getCORSHeaders(), "Content-Type": "application/json" },
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { ...getCORSHeaders(), "Content-Type": "application/json" },
      });
    }
  }

  // Eliminar producto
  if (
    url.pathname.startsWith("/api/admin/products/") &&
    req.method === "DELETE"
  ) {
    try {
      const id = url.pathname.split("/").pop();
      const assets = JSON.parse(fs.readFileSync(ASSETS_JSON_PATH, "utf-8"));

      const product = assets.find((p) => p.id === id);
      if (!product) {
        throw new Error("Product not found");
      }

      // Eliminar imagen
      const imagePath = path.join("frontend", product.url);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }

      // Actualizar assets.json
      const newAssets = assets.filter((p) => p.id !== id);
      updateAssetsJson(newAssets);

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...getCORSHeaders(), "Content-Type": "application/json" },
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { ...getCORSHeaders(), "Content-Type": "application/json" },
      });
    }
  }

  return new Response("Not Found", {
    status: 404,
    headers: getCORSHeaders(),
  });
}
