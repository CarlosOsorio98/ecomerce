import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const ASSETS_DIR = 'frontend/assets'

export const processAndSaveImage = async (file, filename) => {
  const webpFilename = filename.replace(/\.[^/.]+$/, '') + '.webp'
  const outputPath = path.join(ASSETS_DIR, webpFilename)

  if (fs.existsSync(outputPath)) {
    const oldPath = path.join(ASSETS_DIR, 'old-' + webpFilename)
    if (fs.existsSync(oldPath)) {
      fs.unlinkSync(oldPath)
    }
    fs.renameSync(outputPath, oldPath)
  }

  await sharp(await file.arrayBuffer())
    .webp({ quality: 80 })
    .toFile(outputPath)

  return `assets/${webpFilename}`
}
