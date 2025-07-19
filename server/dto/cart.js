import { z } from 'zod'

export const addToCartSchema = z.object({
  product_id: z.string().min(1, 'Product ID required').optional(),
  asset_id: z.string().min(1, 'Product ID required').optional(), // For backward compatibility
  quantity: z.number().int().min(-100).max(100),
}).refine((data) => data.product_id || data.asset_id, {
  message: 'Either product_id or asset_id is required',
})
