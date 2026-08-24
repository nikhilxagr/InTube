import { apiClient } from './api.js';

function extractFilename(response, defaultName) {
  let filename = defaultName;
  const disposition = response.headers?.['content-disposition'];
  if (disposition) {
    const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i);
    const standardMatch = disposition.match(/filename="?([^";]+)"?/i);
    if (utf8Match && utf8Match[1]) {
      filename = decodeURIComponent(utf8Match[1]);
    } else if (standardMatch && standardMatch[1]) {
      filename = standardMatch[1];
    }
  }
  return filename;
}

export const ToolsService = {
  /**
   * Uploads a local file for technical ffprobe/ffmpeg inspection.
   * @param {File} file
   * @returns {Promise<object>}
   */
  async inspectFile(file) {
    const formData = new FormData();
    formData.append('file', file);

    const res = await apiClient.post('/tools/inspect', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return res.data;
  },

  /**
   * Uploads a video file and converts it to audio (MP3, M4A, WAV, AAC, OGG).
   */
  async videoToAudio(file, { format = 'mp3', bitrate = '320k' } = {}, onUploadProgress) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('format', format);
    formData.append('bitrate', bitrate);

    const response = await apiClient.post('/tools/video-to-audio', formData, {
      responseType: 'blob',
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (onUploadProgress && e.total) {
          onUploadProgress({ percent: Math.round((e.loaded * 100) / e.total), loaded: e.loaded, total: e.total });
        }
      }
    });

    const filename = extractFilename(response, `${file.name.replace(/\.[^/.]+$/, '')}.${format}`);
    return { blob: response.data, filename };
  },

  /**
   * Audio converter (converts between audio formats).
   */
  async audioConverter(file, { format = 'mp3', bitrate = '320k' } = {}, onUploadProgress) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('format', format);
    formData.append('bitrate', bitrate);

    const response = await apiClient.post('/tools/audio-converter', formData, {
      responseType: 'blob',
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (onUploadProgress && e.total) {
          onUploadProgress({ percent: Math.round((e.loaded * 100) / e.total), loaded: e.loaded, total: e.total });
        }
      }
    });

    const filename = extractFilename(response, `${file.name.replace(/\.[^/.]+$/, '')}.${format}`);
    return { blob: response.data, filename };
  },

  /**
   * Extracts frames/images from a video file.
   */
  async videoToImage(file, { mode = 'first_frame', timestamp = '00:00:00.100', interval = 5, format = 'jpg' } = {}, onUploadProgress) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('mode', mode);
    formData.append('timestamp', timestamp);
    formData.append('interval', interval);
    formData.append('format', format);

    const response = await apiClient.post('/tools/video-to-image', formData, {
      responseType: 'blob',
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (onUploadProgress && e.total) {
          onUploadProgress({ percent: Math.round((e.loaded * 100) / e.total), loaded: e.loaded, total: e.total });
        }
      }
    });

    const defaultExt = mode === 'interval' ? 'zip' : format;
    const filename = extractFilename(response, `${file.name.replace(/\.[^/.]+$/, '')}_frames.${defaultExt}`);
    return { blob: response.data, filename };
  },

  /**
   * Converts image to JPG, PNG, WebP, or AVIF.
   */
  async imageConvert(file, { format = 'webp', quality = 85 } = {}, onUploadProgress) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('format', format);
    formData.append('quality', quality);

    const response = await apiClient.post('/tools/image/convert', formData, {
      responseType: 'blob',
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (onUploadProgress && e.total) {
          onUploadProgress({ percent: Math.round((e.loaded * 100) / e.total), loaded: e.loaded, total: e.total });
        }
      }
    });

    const filename = extractFilename(response, `${file.name.replace(/\.[^/.]+$/, '')}.${format}`);
    return { blob: response.data, filename };
  },

  /**
   * Compresses image with quality control.
   */
  async imageCompress(file, { quality = 75 } = {}, onUploadProgress) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('quality', quality);

    const response = await apiClient.post('/tools/image/compress', formData, {
      responseType: 'blob',
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (onUploadProgress && e.total) {
          onUploadProgress({ percent: Math.round((e.loaded * 100) / e.total), loaded: e.loaded, total: e.total });
        }
      }
    });

    const origSize = parseInt(response.headers?.['x-original-size'] || '0', 10);
    const outSize = parseInt(response.headers?.['x-output-size'] || '0', 10);
    const reductionPercent = parseInt(response.headers?.['x-reduction-percent'] || '0', 10);

    const filename = extractFilename(response, `compressed_${file.name}`);
    return { blob: response.data, filename, origSize, outSize, reductionPercent };
  },

  /**
   * Resizes image dimensions.
   */
  async imageResize(file, { width, height, allowUpscale = false } = {}, onUploadProgress) {
    const formData = new FormData();
    formData.append('file', file);
    if (width) formData.append('width', width);
    if (height) formData.append('height', height);
    formData.append('allowUpscale', allowUpscale);

    const response = await apiClient.post('/tools/image/resize', formData, {
      responseType: 'blob',
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (onUploadProgress && e.total) {
          onUploadProgress({ percent: Math.round((e.loaded * 100) / e.total), loaded: e.loaded, total: e.total });
        }
      }
    });

    const filename = extractFilename(response, `resized_${file.name}`);
    return { blob: response.data, filename };
  },

  /**
   * Converts video format (MP4, WebM, MOV).
   */
  async convertVideo(file, { format = 'mp4', quality = 'balanced' } = {}, onUploadProgress) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('format', format);
    formData.append('quality', quality);

    const response = await apiClient.post('/tools/convert', formData, {
      responseType: 'blob',
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (onUploadProgress && e.total) {
          onUploadProgress({ percent: Math.round((e.loaded * 100) / e.total), loaded: e.loaded, total: e.total });
        }
      }
    });

    const filename = extractFilename(response, `${file.name.replace(/\.[^/.]+$/, '')}.${format}`);
    return { blob: response.data, filename };
  },

  /**
   * Analyzes multiple URLs in batch.
   * @param {string[]} urls
   * @returns {Promise<object>}
   */
  async batchAnalyze(urls) {
    const res = await apiClient.post('/tools/batch/analyze', { urls });
    return res.data;
  },

  /**
   * Retrieves HD thumbnail details.
   */
  async getThumbnail(url) {
    const res = await apiClient.post('/tools/thumbnail', { url });
    return res.data;
  },

  /**
   * Creates ephemeral transfer token.
   */
  async createTransfer(jobId) {
    const res = await apiClient.post('/transfer/create', { jobId });
    return res.data;
  },

  /**
   * Gets mobile transfer info.
   */
  async getTransferInfo(token) {
    const res = await apiClient.get(`/transfer/${token}`);
    return res.data;
  },

  /**
   * Trigger direct browser download from Blob.
   */
  triggerDownload(blob, filename) {
    const objectUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => window.URL.revokeObjectURL(objectUrl), 2000);
  }
};
