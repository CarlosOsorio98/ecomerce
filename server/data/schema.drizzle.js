import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import { sql } from 'drizzle-orm'
import { 
  sqliteTable, 
  text, 
  integer, 
  real,
  foreignKey,
  unique,
  index
} from 'drizzle-orm/sqlite-core'

// Database connection
const client = createClient({
  url: 'file:./data/db.sqlite',
})

export const db = drizzle(client)

// Schema definitions
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  name: text('name'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
})

export const products = sqliteTable('products', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  price: real('price').notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
})

export const assets = sqliteTable('assets', {
  id: text('id').primaryKey(),
  url: text('url'),
  urlLocal: text('url_local'),
  productId: text('product_id').notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  productIdIdx: index('idx_assets_product_id').on(table.productId),
  productIdFk: foreignKey({
    columns: [table.productId],
    foreignColumns: [products.id],
  }).onDelete('cascade'),
}))

export const cart = sqliteTable('cart', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  productId: text('product_id').notNull(),
  userId: integer('user_id').notNull(),
  quantity: integer('quantity').notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  userIdIdx: index('idx_cart_user_id').on(table.userId),
  productIdIdx: index('idx_cart_product_id').on(table.productId),
  uniqueUserProduct: unique().on(table.productId, table.userId),
  productIdFk: foreignKey({
    columns: [table.productId],
    foreignColumns: [products.id],
  }).onDelete('cascade'),
  userIdFk: foreignKey({
    columns: [table.userId],
    foreignColumns: [users.id],
  }).onDelete('cascade'),
}))

export const favorites = sqliteTable('favorites', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull(),
  productId: text('product_id').notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  userIdIdx: index('idx_favorites_user_id').on(table.userId),
  productIdIdx: index('idx_favorites_product_id').on(table.productId),
  uniqueUserProduct: unique().on(table.userId, table.productId),
  userIdFk: foreignKey({
    columns: [table.userId],
    foreignColumns: [users.id],
  }).onDelete('cascade'),
  productIdFk: foreignKey({
    columns: [table.productId],
    foreignColumns: [products.id],
  }).onDelete('cascade'),
}))

export const jwtTokens = sqliteTable('jwt_tokens', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull(),
  token: text('token').notNull(),
  expiresAt: text('expires_at').notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  userIdIdx: index('idx_jwt_tokens_user_id').on(table.userId),
  expiresAtIdx: index('idx_jwt_tokens_expires_at').on(table.expiresAt),
  userIdFk: foreignKey({
    columns: [table.userId],
    foreignColumns: [users.id],
  }).onDelete('cascade'),
}))

// Relations for better type inference
export const usersRelations = {
  cart: {
    relation: 'many',
    table: cart,
    fields: [users.id],
    references: [cart.userId],
  },
  favorites: {
    relation: 'many',
    table: favorites,
    fields: [users.id],
    references: [favorites.userId],
  },
  jwtTokens: {
    relation: 'many',
    table: jwtTokens,
    fields: [users.id],
    references: [jwtTokens.userId],
  },
}

export const productsRelations = {
  assets: {
    relation: 'many',
    table: assets,
    fields: [products.id],
    references: [assets.productId],
  },
  cart: {
    relation: 'many',
    table: cart,
    fields: [products.id],
    references: [cart.productId],
  },
  favorites: {
    relation: 'many',
    table: favorites,
    fields: [products.id],
    references: [favorites.productId],
  },
}