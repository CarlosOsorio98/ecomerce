import { localData } from '@/data/local.js'
import { getAllAssets } from '@/repositories/assetRepository.js'
import { randomUUID } from 'crypto'
import fs from 'node:fs'

const ASSETS_JSON_PATH = 'frontend/assets.json'

export const getAssets = () => getAllAssets()

export const getAssetsFromFile = () => {
  return JSON.parse(fs.readFileSync(ASSETS_JSON_PATH, 'utf-8'))
}

export const saveAssetsToFile = (assets) => {
  fs.writeFileSync(ASSETS_JSON_PATH, JSON.stringify(assets, null, 2))
}

export const createAsset = (name, price, imageUrl) => {
  const assets = getAssetsFromFile()
  const newAsset = {
    id: randomUUID(),
    name,
    price,
    url: imageUrl,
  }

  assets.push(newAsset)
  saveAssetsToFile(assets)
  localData().syncAssets()

  return newAsset
}

export const deleteAsset = (assetId) => {
  const assets = getAssetsFromFile()
  const assetIndex = assets.findIndex((a) => a.id === assetId)

  if (assetIndex === -1) {
    return null
  }

  const asset = assets[assetIndex]
  assets.splice(assetIndex, 1)
  saveAssetsToFile(assets)
  localData().syncAssets()

  return asset
}
