const multer = require('multer');
const HttpError = require('../utils/HttpError');

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

// Memory storage on purpose: sharp re-encodes every image to webp before it is
// written to server/uploads, so writing the original to disk first would just
// be an extra file to clean up.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE, files: 4 },
  fileFilter(req, file, cb) {
    if (!ALLOWED_TYPES.includes(file.mimetype)) {
      return cb(new HttpError(400, 'Only JPG, PNG, WebP or GIF images are allowed'));
    }
    cb(null, true);
  },
});

const MULTER_MESSAGES = {
  LIMIT_FILE_SIZE: 'Each image must be 5 MB or smaller',
  LIMIT_FILE_COUNT: 'You can attach up to 4 images',
  LIMIT_UNEXPECTED_FILE: 'You can attach up to 4 images',
};

function uploadErrorMessage(err) {
  return MULTER_MESSAGES[err.code] || err.message;
}

module.exports = {
  postImages: upload.array('images', 4),
  profileImages: upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'cover', maxCount: 1 },
  ]),
  uploadErrorMessage,
};
