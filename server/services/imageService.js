import fs from 'fs'
import path from 'path'
import sharp from 'sharp'

// Read assets config
const loadAssetsConfig = () => {
  try {
    const configPath = './assets/config.json'
    const configData = fs.readFileSync(configPath, 'utf8')
    const config = JSON.parse(configData)
    return config.local.path || './assets/cdn/'
  } catch (error) {
    console.error('Error loading assets config:', error)
    return './assets/cdn/' // fallback
  }
}

const ASSETS_DIR = loadAssetsConfig()

export const processAndSaveImage = async (file, filename) => {
  const webpFilename = filename.replace(/\.[^/.]+$/, '') + '.webp'
  const outputPath = path.join(ASSETS_DIR, webpFilename)

  // Ensure the directory exists
  if (!fs.existsSync(ASSETS_DIR)) {
    fs.mkdirSync(ASSETS_DIR, { recursive: true })
  }

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

  // Return the correct path based on the config
  return `/assets/cdn/${webpFilename}`
}
