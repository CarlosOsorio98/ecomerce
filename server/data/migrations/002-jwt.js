// Migración 2: crea tabla para JWT (revocación o manejo de sesiones)
export async function up(db) {
  db.run(`CREATE TABLE IF NOT EXISTS jwt_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    revoked BOOLEAN DEFAULT 0,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);
}
