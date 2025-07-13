import { getCORSHeaders } from '../middleware/cors.js'
import { getAssets } from '../services/assetService.js'

export const getAssetsList = async (req) => {
  const assets = getAssets()

  return new Response(JSON.stringify(assets), {
    status: 200,
    headers: { ...getCORSHeaders(), 'Content-Type': 'application/json' },
  })
}
