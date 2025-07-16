// Controlador de migraciones para libSQL
import { db } from "../server/data/schema.js";
import { readdirSync } from "fs";
import path from "path";

const migrationsDir = path.resolve("./data/migrations");

// Asegura la tabla de migraciones
async function ensureMigrationsTable() {
  await db.execute(`CREATE TABLE IF NOT EXISTS migrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    run_on DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
}

// Obtiene migraciones ya aplicadas
async function getAppliedMigrations() {
  const result = await db.execute("SELECT name FROM migrations");
  return result.rows.map((m) => m.name);
}

// Ejecuta migraciones pendientes
async function runMigrations() {
  await ensureMigrationsTable();
  const files = readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".js"))
    .sort();
  const applied = await getAppliedMigrations();
  for (const file of files) {
    if (!applied.includes(file)) {
      const migration = await import(path.join(migrationsDir, file));
      if (typeof migration.up === "function") {
        console.log(`Ejecutando migración: ${file}`);
        await migration.up(db);
        await db.execute({
          sql: "INSERT INTO migrations (name) VALUES (?)",
          args: [file]
        });
      }
    }
  }
  console.log("Migraciones completadas.");
}

runMigrations();
