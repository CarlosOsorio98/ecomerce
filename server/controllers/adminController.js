import { createNotFoundError, createValidationError } from '@/errors.js'
import { getCORSHeaders } from '@/middleware/cors.js'
import {
  createAsset,
  deleteAsset,
  getAssetsFromFile,
} from '@/services/assetService.js'
import { processAndSaveImage } from '@/services/imageService.js'

export const getAdminPanel = async (req) => {
  const file = globalThis.Bun.file('./server/templates/admin.html')
  return new Response(file, {
    headers: { ...getCORSHeaders(), 'Content-Type': 'text/html' },
  })
}

export const getAssets = async (req) => {
  const assets = getAssetsFromFile()
  return new Response(JSON.stringify(assets), {
    status: 200,
    headers: { ...getCORSHeaders(), 'Content-Type': 'application/json' },
  })
}

export const addAsset = async (req) => {
  const formData = await req.formData()
  const name = formData.get('name')
  const price = parseFloat(formData.get('price'))
  const file = formData.get('file')

  if (!name || !price || !file) {
    throw createValidationError('Missing required data')
  }

  const imageUrl = await processAndSaveImage(file, file.name)
  const newAsset = createAsset(name, price, imageUrl)

  return new Response(JSON.stringify(newAsset), {
    status: 201,
    headers: { ...getCORSHeaders(), 'Content-Type': 'application/json' },
  })
}

export const removeAsset = async (req) => {
  const url = new URL(req.url)
  const assetId = url.pathname.split('/').pop()

  const asset = deleteAsset(assetId)

  if (!asset) {
    throw createNotFoundError('Asset not found')
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { ...getCORSHeaders(), 'Content-Type': 'application/json' },
  })
}
