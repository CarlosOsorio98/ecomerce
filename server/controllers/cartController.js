import { addToCartSchema } from '@/dto/cart.js'
import { createValidationError } from '@/errors.js'
import { getCORSHeaders } from '@/middleware/cors.js'
import {
  addItemToCart,
  getCartItems,
  removeItemFromCart,
} from '@/services/cartService.js'

export const getCart = async (req) => {
  const cart = await getCartItems()

  return new Response(JSON.stringify(cart), {
    status: 200,
    headers: { ...getCORSHeaders(), 'Content-Type': 'application/json' },
  })
}

export const addToCart = async (req) => {
  const body = await req.json()
  const parsed = addToCartSchema.safeParse(body)

  if (!parsed.success) {
    throw createValidationError('Invalid data', parsed.error.errors)
  }

  const result = await addItemToCart(body.asset_id, body.quantity)

  return new Response(JSON.stringify(result), {
    status: 200,
    headers: { ...getCORSHeaders(), 'Content-Type': 'application/json' },
  })
}

export const removeFromCart = async (req) => {
  const url = new URL(req.url)
  const id = url.pathname.split('/').pop()

  const result = await removeItemFromCart(id)

  return new Response(JSON.stringify(result), {
    status: 200,
    headers: { ...getCORSHeaders(), 'Content-Type': 'application/json' },
  })
}
