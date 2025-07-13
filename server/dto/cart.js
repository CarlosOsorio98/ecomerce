import { z } from 'zod'

export const addToCartSchema = z.object({
  asset_id: z.string().min(1, 'Product ID required'),
  quantity: z.number().int().min(-100).max(100),
})
