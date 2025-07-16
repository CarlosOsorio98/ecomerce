export const config = {
  server: {
    port: process.env.PORT || 3000,
    host: process.env.HOST || 'localhost',
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: 'GET, POST, PUT, DELETE, OPTIONS',
    headers: 'Content-Type, Authorization',
    credentials: true,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'ecomerce_jwt_secrec',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  admin: {
    key: process.env.ADMIN_KEY || 'admin',
  },
  database: {
    path: './data/db.sqlite',
  },
}
