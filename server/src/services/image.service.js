import sharp from 'sharp';
import fsPromises from 'fs/promises';
import { config } from '../config/config.js';
import { InvalidMediaFileError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

export class ImageService {
  /**
   * Validates and inspects an image file with Sharp.
   * @param {string} inputPath
   * @returns {Promise<object>}
   */
  async inspect(inputPath) {
    try {
      const metadata = await sharp(inputPath, { failOn: 'error' }).metadata();
      const stats = await fsPromises.stat(inputPath);

      const pixels = (metadata.width || 0) * (metadata.height || 0);
      if (pixels > config.MAX_IMAGE_PIXELS) {
        throw new InvalidMediaFileError(
          `Image resolution too high (${metadata.width}x${metadata.height}). Maximum allowable is 25 Megapixels.`
        );
      }

      return {
        format: metadata.format,
        width: metadata.width,
        height: metadata.height,
        space: metadata.space,
        channels: metadata.channels,
        hasAlpha: metadata.hasAlpha,
        sizeBytes: stats.size,
        sizeMB: (stats.size / (1024 * 1024)).toFixed(2)
      };
    } catch (err) {
      if (err instanceof InvalidMediaFileError) throw err;
      logger.warn({ err: err.message, inputPath }, 'Failed to inspect image');
      throw new InvalidMediaFileError(`Invalid or unsupported image file: ${err.message}`);
    }
  }

  /**
   * Converts an image into a target format (jpg, png, webp, avif).
   * @param {string} inputPath
   * @param {string} outputPath
   * @param {string} targetFormat - 'jpg' | 'jpeg' | 'png' | 'webp' | 'avif'
   * @param {object} [options={}]
   * @returns {Promise<object>}
   */
  async convert(inputPath, outputPath, targetFormat, options = {}) {
    const format = targetFormat.toLowerCase().replace('jpeg', 'jpg');
    const quality = options.quality ? parseInt(options.quality, 10) : 85;

    let pipeline = sharp(inputPath, { failOn: 'error' }).rotate(); // Auto-rotate by EXIF orientation

    switch (format) {
      case 'jpg':
        pipeline = pipeline.jpeg({ quality, mozjpeg: true });
        break;
      case 'png':
        pipeline = pipeline.png({ compressionLevel: 8 });
        break;
      case 'webp':
        pipeline = pipeline.webp({ quality });
        break;
      case 'avif':
        pipeline = pipeline.avif({ quality, effort: 4 });
        break;
      default:
        throw new InvalidMediaFileError(`Unsupported target image format: ${targetFormat}`);
    }

    await pipeline.toFile(outputPath);
    const inStats = await fsPromises.stat(inputPath);
    const outStats = await fsPromises.stat(outputPath);

    return {
      originalSizeBytes: inStats.size,
      outputSizeBytes: outStats.size,
      targetFormat: format,
      format
    };
  }

  /**
   * Compresses an image with controlled quality.
   * @param {string} inputPath
   * @param {string} outputPath
   * @param {object} [options={}]
   * @returns {Promise<object>}
   */
  async compress(inputPath, outputPath, options = {}) {
    const quality = options.quality ? Math.max(10, Math.min(100, parseInt(options.quality, 10))) : 75;
    const metadata = await sharp(inputPath, { failOn: 'error' }).metadata();
    const format = (metadata.format || 'jpeg').toLowerCase();

    let pipeline = sharp(inputPath, { failOn: 'error' }).rotate();

    if (format === 'jpeg' || format === 'jpg') {
      pipeline = pipeline.jpeg({ quality, mozjpeg: true });
    } else if (format === 'png') {
      pipeline = pipeline.png({ quality, compressionLevel: 9, effort: 7 });
    } else if (format === 'webp') {
      pipeline = pipeline.webp({ quality });
    } else if (format === 'avif') {
      pipeline = pipeline.avif({ quality, effort: 4 });
    } else {
      // Fallback compress to webp
      pipeline = pipeline.webp({ quality });
    }

    await pipeline.toFile(outputPath);
    const inStats = await fsPromises.stat(inputPath);
    const outStats = await fsPromises.stat(outputPath);

    const savedBytes = Math.max(0, inStats.size - outStats.size);
    const reductionPercent = inStats.size > 0 ? Math.round((savedBytes / inStats.size) * 100) : 0;

    return {
      originalSizeBytes: inStats.size,
      outputSizeBytes: outStats.size,
      savedBytes,
      reductionPercent
    };
  }

  /**
   * Resizes an image while preserving aspect ratio.
   * @param {string} inputPath
   * @param {string} outputPath
   * @param {object} options
   * @returns {Promise<object>}
   */
  async resize(inputPath, outputPath, options = {}) {
    const width = options.width ? parseInt(options.width, 10) : null;
    const height = options.height ? parseInt(options.height, 10) : null;
    const allowUpscale = options.allowUpscale === true || options.allowUpscale === 'true';

    if (!width && !height) {
      throw new InvalidMediaFileError('At least one of width or height must be specified for image resize.');
    }

    const metadata = await sharp(inputPath, { failOn: 'error' }).metadata();
    const format = (metadata.format || 'jpeg').toLowerCase();

    let pipeline = sharp(inputPath, { failOn: 'error' })
      .rotate()
      .resize({
        width: width || undefined,
        height: height || undefined,
        fit: options.fit || 'inside',
        withoutEnlargement: !allowUpscale
      });

    if (format === 'jpeg' || format === 'jpg') {
      pipeline = pipeline.jpeg({ quality: 90, mozjpeg: true });
    } else if (format === 'png') {
      pipeline = pipeline.png({ compressionLevel: 8 });
    } else if (format === 'webp') {
      pipeline = pipeline.webp({ quality: 90 });
    }

    await pipeline.toFile(outputPath);
    const outMeta = await sharp(outputPath).metadata();
    const outStats = await fsPromises.stat(outputPath);

    return {
      width: outMeta.width,
      height: outMeta.height,
      outputSizeBytes: outStats.size
    };
  }

  inspectImage(inputPath) {
    return this.inspect(inputPath);
  }

  convertImage(inputPath, outputPath, options = {}) {
    return this.convert(inputPath, outputPath, options.format || 'webp', options);
  }

  compressImage(inputPath, outputPath, options = {}) {
    return this.compress(inputPath, outputPath, options);
  }

  resizeImage(inputPath, outputPath, options = {}) {
    return this.resize(inputPath, outputPath, options);
  }
}

export const imageService = new ImageService();
