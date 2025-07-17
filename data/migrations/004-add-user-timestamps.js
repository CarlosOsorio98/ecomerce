// Migración 4: agrega timestamps a la tabla users
export async function up(db) {
  await db.execute(`ALTER TABLE users ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP`)
  await db.execute(`ALTER TABLE users ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP`)
}