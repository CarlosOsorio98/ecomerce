// Migración 3: crea tabla para favoritos de usuarios
export async function up(db) {
  await db.execute(`CREATE TABLE IF NOT EXISTS favorites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    asset_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(asset_id) REFERENCES assets(id),
    UNIQUE(user_id, asset_id)
  )`)
}