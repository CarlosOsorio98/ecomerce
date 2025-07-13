import { db } from '../data/schema.js'

export const getAllAssets = () => db.query('SELECT * FROM assets').all()

export const getAssetById = (id) =>
  db.query('SELECT * FROM assets WHERE id = ?').get(id)
