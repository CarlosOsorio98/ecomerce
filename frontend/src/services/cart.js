// Servicio para consumir la API del carrito
const API_BASE = '/api'

export const cartService = {
  async getCart() {
    const res = await fetch(`${API_BASE}/cart`)
    if (!res.ok) throw new Error('Error al obtener el carrito')
    return res.json()
  },
  async addToCart(asset_id, quantity) {
    const res = await fetch(`${API_BASE}/cart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ asset_id, quantity }),
    })
    if (!res.ok) throw new Error('Error al agregar al carrito')
    return res.json()
  },
  async removeFromCart(id) {
    const res = await fetch(`${API_BASE}/cart/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('Error al eliminar del carrito')
    return res.json()
  },
}
