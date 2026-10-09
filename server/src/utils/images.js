const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');
const sharp = require('sharp');
const env = require('../config/env');
const HttpError = require('./HttpError');

const PRESETS = {
  post: { width: 1600, height: 1600, fit: 'inside' },
  avatar: { width: 400, height: 400, fit: 'cover' },
  cover: { width: 1500, height: 500, fit: 'cover' },
};

// Every upload is re-encoded, which also strips EXIF (GPS location from phone
// photos) and rejects files that only pretend to be images by their MIME type.
async function saveImage(file, preset = 'post') {
  const options = PRESETS[preset];
  let output;
  try {
    output = await sharp(file.buffer)
      .rotate()
      .resize({ ...options, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer({ resolveWithObject: true });
  } catch {
    throw new HttpError(400, `${file.originalname} could not be read as an image`);
  }

  await fs.mkdir(env.uploadDir, { recursive: true });
  const filename = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}.webp`;
  await fs.writeFile(path.join(env.uploadDir, filename), output.data);

  return { url: `/uploads/${filename}`, width: output.info.width, height: output.info.height };
}

async function removeImage(url) {
  if (!url || !url.startsWith('/uploads/')) return;
  const filePath = path.join(env.uploadDir, path.basename(url));
  await fs.unlink(filePath).catch(() => {});
}

module.exports = { saveImage, removeImage };
