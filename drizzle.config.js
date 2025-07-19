import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  dialect: 'sqlite',
  schema: './server/data/schema.drizzle.js',
  out: './data/migrations',
  dbCredentials: {
    url: 'file:./data/db.sqlite',
  },
  verbose: true,
  strict: true,
})