// Esquemas de validación para la aplicación
import { z } from 'zod'

// Esquema de validación para un producto
export const productSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  price: z.number(),
})

// Esquema de validación para un asset
export const assetSchema = z.object({
  id: z.string(),
  url: z.string().optional(),
  url_local: z.string().optional(),
  product_id: z.string(),
})

// Esquema de validación para registro de usuario
export const userRegisterSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
})

// Esquema de validación para login
export const userLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})
