import { config } from '../config.js'
import { z } from 'zod'

export const adminPasswordSchema = z.object({
  password: z.string().refine((val) => {
    const configuredKey = config.admin.key
    const isConfiguredKey = val === configuredKey
    const isUUID =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        val
      )
    return isConfiguredKey || (configuredKey !== 'admin' && isUUID)
  }, 'La contraseña debe coincidir con la configuración del admin o ser un UUID válido'),
})

export const validateAdminPassword = (password) => {
  return adminPasswordSchema.parse({ password })
}
