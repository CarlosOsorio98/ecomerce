import { createNotFoundError, createValidationError } from '@/errors.js'
import { getCORSHeaders } from '@/middleware/cors.js'
import {
  createAsset,
  deleteAsset,
  getAssets as getAssetsFromDB,
  updateAssetData,
} from '@/services/assetService.js'
import { processAndSaveImage } from '@/services/imageService.js'


export const getAssets = async (req) => {
  const assets = await getAssetsFromDB()
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
  const newAsset = await createAsset(name, price, imageUrl)

  return new Response(JSON.stringify(newAsset), {
    status: 201,
    headers: { ...getCORSHeaders(), 'Content-Type': 'application/json' },
  })
}

export const updateAsset = async (req) => {
  const url = new URL(req.url)
  const assetId = url.pathname.split('/').pop()
  const formData = await req.formData()
  
  const name = formData.get('name')
  const price = parseFloat(formData.get('price'))
  const file = formData.get('file')

  if (!name || !price) {
    throw createValidationError('Missing required data')
  }

  let imageUrl
  if (file && file.size > 0) {
    imageUrl = await processAndSaveImage(file, file.name)
  }

  const updatedAsset = await updateAssetData(assetId, name, price, imageUrl)

  if (!updatedAsset) {
    throw createNotFoundError('Asset not found')
  }

  return new Response(JSON.stringify(updatedAsset), {
    status: 200,
    headers: { ...getCORSHeaders(), 'Content-Type': 'application/json' },
  })
}

export const removeAsset = async (req) => {
  const url = new URL(req.url)
  const assetId = url.pathname.split('/').pop()

  const asset = await deleteAsset(assetId)

  if (!asset) {
    throw createNotFoundError('Asset not found')
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { ...getCORSHeaders(), 'Content-Type': 'application/json' },
  })
}
