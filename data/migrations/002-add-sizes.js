export async function up(db) {
  // Create product_sizes table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS product_sizes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id TEXT NOT NULL,
      size TEXT NOT NULL,
      price REAL NOT NULL,
      stock INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(product_id, size),
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    )
  `);

  // Add size_id column to cart table
  await db.execute(`
    ALTER TABLE cart ADD COLUMN size_id INTEGER;
  `);

  // Create index on size_id in cart
  await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_cart_size_id ON cart(size_id);
  `);

  // Create index on product_id in product_sizes
  await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_product_sizes_product_id ON product_sizes(product_id);
  `);

  // Drop the old unique constraint and add new one that includes size_id
  await db.execute(`
    CREATE TABLE cart_temp (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id TEXT NOT NULL,
      user_id INTEGER NOT NULL,
      size_id INTEGER,
      quantity INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY(size_id) REFERENCES product_sizes(id) ON DELETE CASCADE,
      UNIQUE(product_id, user_id, size_id)
    )
  `);

  // Copy data from old cart table
  await db.execute(`
    INSERT INTO cart_temp (id, product_id, user_id, quantity, created_at, updated_at)
    SELECT id, product_id, user_id, quantity, created_at, updated_at FROM cart
  `);

  // Drop old cart table and rename temp
  await db.execute(`DROP TABLE cart`);
  await db.execute(`ALTER TABLE cart_temp RENAME TO cart`);

  // Recreate indexes for cart
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_cart_user_id ON cart(user_id)`);
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_cart_product_id ON cart(product_id)`);
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_cart_size_id ON cart(size_id)`);

  // Remove price column from products table (SQLite doesn't support DROP COLUMN directly)
  await db.execute(`
    CREATE TABLE products_temp (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Copy data from old products table (excluding price)
  await db.execute(`
    INSERT INTO products_temp (id, name, description, created_at, updated_at)
    SELECT id, name, description, created_at, updated_at FROM products
  `);

  // Drop old products table and rename temp
  await db.execute(`DROP TABLE products`);
  await db.execute(`ALTER TABLE products_temp RENAME TO products`);

  // Recreate the products updated_at trigger
  await db.execute(`
    CREATE TRIGGER IF NOT EXISTS products_updated_at
    AFTER UPDATE ON products
    BEGIN
      UPDATE products SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END
  `);

  // Create trigger for product_sizes updated_at
  await db.execute(`
    CREATE TRIGGER IF NOT EXISTS product_sizes_updated_at
    AFTER UPDATE ON product_sizes
    BEGIN
      UPDATE product_sizes SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END
  `);

  console.log('Migration 002-add-sizes completed');
}

export async function down(db) {
  // Remove size_id column from cart (SQLite doesn't support DROP COLUMN)
  await db.execute(`
    CREATE TABLE cart_temp (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id TEXT NOT NULL,
      user_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(product_id, user_id)
    )
  `);

  await db.execute(`
    INSERT INTO cart_temp (id, product_id, user_id, quantity, created_at, updated_at)
    SELECT id, product_id, user_id, quantity, created_at, updated_at FROM cart
  `);

  await db.execute(`DROP TABLE cart`);
  await db.execute(`ALTER TABLE cart_temp RENAME TO cart`);

  // Drop product_sizes table
  await db.execute(`DROP TABLE IF EXISTS product_sizes`);

  console.log('Migration 002-add-sizes rolled back');
}