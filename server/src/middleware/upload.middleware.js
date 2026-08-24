import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/config.js';
import { createJobDirectory, sanitizeFilename } from '../utils/file-utils.js';
import { FileTooLargeError, UnsupportedFileError } from '../utils/errors.js';

const ALLOWED_EXTENSIONS = new Set([
  // Video
  '.mp4', '.m4v', '.webm', '.mov', '.mkv', '.avi', '.flv', '.wmv', '.3gp', '.ogv',
  // Audio
  '.mp3', '.m4a', '.aac', '.wav', '.ogg', '.flac', '.opus',
  // Image (Metadata inspection)
  '.jpg', '.jpeg', '.png', '.webp', '.gif'
]);

const ALLOWED_MIME_PREFIXES = ['video/', 'audio/', 'image/'];

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      if (!req.jobDir) {
        const { jobId, jobDir } = await createJobDirectory();
        req.jobId = jobId;
        req.jobDir = jobDir;
      }
      cb(null, req.jobDir);
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeBase = sanitizeFilename(path.basename(file.originalname, ext), 'upload');
    const uniqueName = `input_${uuidv4().slice(0, 8)}_${safeBase}${ext}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = (file.mimetype || '').toLowerCase();

  const isAllowedExt = ALLOWED_EXTENSIONS.has(ext);
  const isAllowedMime = ALLOWED_MIME_PREFIXES.some((prefix) => mime.startsWith(prefix)) ||
    mime === 'application/octet-stream'; // Some OS/browsers upload .mov or .mkv as octet-stream

  if (isAllowedExt && isAllowedMime) {
    cb(null, true);
  } else {
    cb(new UnsupportedFileError(`File type "${ext || 'unknown'}" (${mime}) is not supported.`));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.MAX_UPLOAD_SIZE_BYTES,
    files: 1
  }
});

/**
 * Express middleware wrapper that handles multer errors cleanly with AppError types.
 */
export function handleFileUpload(fieldName = 'file') {
  const single = upload.single(fieldName);

  return (req, res, next) => {
    single(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return next(new FileTooLargeError(`Uploaded file exceeds the maximum allowed limit of ${config.MAX_UPLOAD_SIZE_MB}MB.`));
          }
          return next(new UnsupportedFileError(`File upload error: ${err.message}`));
        }
        return next(err);
      }

      if (!req.file) {
        return next(new UnsupportedFileError('Please select or drop a valid media file to upload.'));
      }

      next();
    });
  };
}
