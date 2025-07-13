// Inicializa la base de datos y carga los assets desde assets.json
import { z } from 'zod'

// Esquema de validación para un asset
export const assetSchema = z.object({
  id: z.string(),
  name: z.string(),
  url: z.string(),
  price: z.number(),
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
