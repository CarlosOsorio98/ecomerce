// Initial migration: Creates all normalized tables with automatic timestamps
export async function up(db) {
  // Users table
  await db.execute(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`)

  // Products table (normalized from old assets table)
  await db.execute(`CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`)

  // Assets table (for product images/files)
  await db.execute(`CREATE TABLE IF NOT EXISTS assets (
    id TEXT PRIMARY KEY,
    url TEXT,
    url_local TEXT,
    product_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE
  )`)

  // Cart table (per user)
  await db.execute(`CREATE TABLE IF NOT EXISTS cart (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id TEXT NOT NULL,
    user_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(product_id, user_id)
  )`)

  // Favorites table
  await db.execute(`CREATE TABLE IF NOT EXISTS favorites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    product_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE(user_id, product_id)
  )`)

  // JWT tokens table for session management
  await db.execute(`CREATE TABLE IF NOT EXISTS jwt_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token TEXT NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  )`)

  // Create triggers for automatic updated_at timestamps
  await db.execute(`
    CREATE TRIGGER IF NOT EXISTS users_updated_at
    AFTER UPDATE ON users
    BEGIN
      UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END
  `)

  await db.execute(`
    CREATE TRIGGER IF NOT EXISTS products_updated_at
    AFTER UPDATE ON products
    BEGIN
      UPDATE products SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END
  `)

  await db.execute(`
    CREATE TRIGGER IF NOT EXISTS assets_updated_at
    AFTER UPDATE ON assets
    BEGIN
      UPDATE assets SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END
  `)

  await db.execute(`
    CREATE TRIGGER IF NOT EXISTS cart_updated_at
    AFTER UPDATE ON cart
    BEGIN
      UPDATE cart SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END
  `)

  // Create indexes for better performance
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_assets_product_id ON assets(product_id)`)
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_cart_user_id ON cart(user_id)`)
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_cart_product_id ON cart(product_id)`)
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id)`)
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_favorites_product_id ON favorites(product_id)`)
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_jwt_tokens_user_id ON jwt_tokens(user_id)`)
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_jwt_tokens_expires_at ON jwt_tokens(expires_at)`)
}

export async function down(db) {
  // Drop all tables in reverse order to respect foreign key constraints
  await db.execute(`DROP TABLE IF EXISTS jwt_tokens`)
  await db.execute(`DROP TABLE IF EXISTS favorites`)
  await db.execute(`DROP TABLE IF EXISTS cart`)
  await db.execute(`DROP TABLE IF EXISTS assets`)
  await db.execute(`DROP TABLE IF EXISTS products`)
  await db.execute(`DROP TABLE IF EXISTS users`)
}