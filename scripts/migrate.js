// Controlador de migraciones para SQLite con Bun
import { db } from "../server/data/schema.js";
import { readdirSync } from "fs";
import path from "path";

const migrationsDir = path.resolve("./server/data/migrations");

// Asegura la tabla de migraciones
function ensureMigrationsTable() {
  db.run(`CREATE TABLE IF NOT EXISTS migrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    run_on DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
}

// Obtiene migraciones ya aplicadas
function getAppliedMigrations() {
  return db
    .query("SELECT name FROM migrations")
    .all()
    .map((m) => m.name);
}

// Ejecuta migraciones pendientes
async function runMigrations() {
  ensureMigrationsTable();
  const files = readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".js"))
    .sort();
  const applied = getAppliedMigrations();
  for (const file of files) {
    if (!applied.includes(file)) {
      const migration = await import(path.join(migrationsDir, file));
      if (typeof migration.up === "function") {
        console.log(`Ejecutando migración: ${file}`);
        await migration.up(db);
        db.run("INSERT INTO migrations (name) VALUES (?)", [file]);
      }
    }
  }
  console.log("Migraciones completadas.");
}

runMigrations();
