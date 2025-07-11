// Esquema de base de datos SQLite persistente y sincronizada usando Bun
import { Database } from "bun:sqlite";

// Crear base de datos en archivo físico (persistente)
export const db = new Database("./server/data/db.sqlite");

db.run("PRAGMA journal_mode = WAL;"); // Modo WAL para concurrencia y persistencia

// Crear tabla de assets (productos)
db.run(`
  CREATE TABLE IF NOT EXISTS assets (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    price REAL NOT NULL
  )
`);

// Crear tabla de carrito de compras
// Un carrito simple: id, asset_id (producto), cantidad
// Puedes expandir con user_id si hay usuarios

db.run(`
  CREATE TABLE IF NOT EXISTS cart (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    asset_id TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    FOREIGN KEY(asset_id) REFERENCES assets(id)
  )
`);

// Crear tabla de usuarios
// id, name, email, password (hash), created_at

db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at TEXT NOT NULL
  )
`);
