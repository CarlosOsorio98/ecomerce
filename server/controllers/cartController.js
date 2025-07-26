import { addToCartSchema } from '../dto/cart.js'
import { createValidationError } from '../errors.js'
import { getCORSHeaders } from '../middleware/cors.js'
import {
  addItemToCart,
  getCartItems,
  removeItemFromCart,
  clearUserCart,
} from '../services/cartService.js'

export const getCart = async (req) => {
  const userId = req.user?.id
  if (!userId) {
    return new Response(JSON.stringify({ error: 'User not authenticated' }), {
      status: 401,
      headers: { ...getCORSHeaders(), 'Content-Type': 'application/json' },
    })
  }

  const cart = await getCartItems(userId)

  return new Response(JSON.stringify(cart), {
    status: 200,
    headers: { ...getCORSHeaders(), 'Content-Type': 'application/json' },
  })
}

export const addToCart = async (req) => {
  const userId = req.user?.id
  if (!userId) {
    return new Response(JSON.stringify({ error: 'User not authenticated' }), {
      status: 401,
      headers: { ...getCORSHeaders(), 'Content-Type': 'application/json' },
    })
  }

  const body = await req.json()
  const parsed = addToCartSchema.safeParse(body)

  if (!parsed.success) {
    throw createValidationError('Invalid data', parsed.error.errors)
  }

  const result = await addItemToCart(body.product_id || body.asset_id, userId, body.quantity, body.size_id)

  return new Response(JSON.stringify(result), {
    status: 200,
    headers: { ...getCORSHeaders(), 'Content-Type': 'application/json' },
  })
}

export const removeFromCart = async (req) => {
  const userId = req.user?.id
  if (!userId) {
    return new Response(JSON.stringify({ error: 'User not authenticated' }), {
      status: 401,
      headers: { ...getCORSHeaders(), 'Content-Type': 'application/json' },
    })
  }

  const url = new URL(req.url)
  const id = url.pathname.split('/').pop()

  const result = await removeItemFromCart(id)

  return new Response(JSON.stringify(result), {
    status: 200,
    headers: { ...getCORSHeaders(), 'Content-Type': 'application/json' },
  })
}

export const clearCart = async (req) => {
  const userId = req.user?.id
  if (!userId) {
    return new Response(JSON.stringify({ error: 'User not authenticated' }), {
      status: 401,
      headers: { ...getCORSHeaders(), 'Content-Type': 'application/json' },
    })
  }

  const result = await clearUserCart(userId)

  return new Response(JSON.stringify(result), {
    status: 200,
    headers: { ...getCORSHeaders(), 'Content-Type': 'application/json' },
  })
}
