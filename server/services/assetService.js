import { 
  getAllAssets, 
  createAsset as createAssetDB, 
  updateAsset as updateAssetDB, 
  deleteAsset as deleteAssetDB 
} from '@/repositories/assetRepository.js'

export const getAssets = async () => await getAllAssets()

export const createAsset = async (name, price, imageUrl) => {
  return await createAssetDB(name, price, imageUrl)
}

export const updateAssetData = async (assetId, name, price, imageUrl) => {
  return await updateAssetDB(assetId, name, price, imageUrl)
}

export const deleteAsset = async (assetId) => {
  return await deleteAssetDB(assetId)
}
