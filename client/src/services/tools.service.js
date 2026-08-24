import { apiClient, API_BASE_URL } from './api.js';

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
   * @param {File} file
   * @param {object} options
   * @param {string} [options.format='mp3']
   * @param {string} [options.bitrate='320k']
   * @param {Function} [onUploadProgress]
   * @returns {Promise<{ blob: Blob, filename: string }>}
   */
  async videoToAudio(file, { format = 'mp3', bitrate = '320k' } = {}, onUploadProgress) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('format', format);
    formData.append('bitrate', bitrate);

    const response = await apiClient.post('/tools/video-to-audio', formData, {
      responseType: 'blob',
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (onUploadProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onUploadProgress({ percent, loaded: progressEvent.loaded, total: progressEvent.total });
        }
      }
    });

    let filename = `${file.name.replace(/\.[^/.]+$/, '')}.${format}`;
    const disposition = response.headers['content-disposition'];
    if (disposition) {
      const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i);
      const standardMatch = disposition.match(/filename="?([^";]+)"?/i);
      if (utf8Match && utf8Match[1]) {
        filename = decodeURIComponent(utf8Match[1]);
      } else if (standardMatch && standardMatch[1]) {
        filename = standardMatch[1];
      }
    }

    // Trigger browser download
    const blob = response.data;
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);

    return { blob, filename };
  },

  /**
   * Uploads a video file and converts it to another format (MP4, WebM, MOV).
   * @param {File} file
   * @param {object} options
   * @param {string} [options.format='mp4']
   * @param {string} [options.quality='balanced']
   * @param {Function} [onUploadProgress]
   * @returns {Promise<{ blob: Blob, filename: string }>}
   */
  async convertVideo(file, { format = 'mp4', quality = 'balanced' } = {}, onUploadProgress) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('format', format);
    formData.append('quality', quality);

    const response = await apiClient.post('/tools/convert', formData, {
      responseType: 'blob',
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (onUploadProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onUploadProgress({ percent, loaded: progressEvent.loaded, total: progressEvent.total });
        }
      }
    });

    let filename = `${file.name.replace(/\.[^/.]+$/, '')}.${format}`;
    const disposition = response.headers['content-disposition'];
    if (disposition) {
      const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i);
      const standardMatch = disposition.match(/filename="?([^";]+)"?/i);
      if (utf8Match && utf8Match[1]) {
        filename = decodeURIComponent(utf8Match[1]);
      } else if (standardMatch && standardMatch[1]) {
        filename = standardMatch[1];
      }
    }

    // Trigger browser download
    const blob = response.data;
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);

    return { blob, filename };
  },

  /**
   * Retrieves official public thumbnail from a supported media URL.
   * @param {string} url
   * @returns {Promise<object>}
   */
  async getThumbnail(url) {
    const res = await apiClient.post('/tools/thumbnail', { url });
    return res.data;
  },

  /**
   * Creates a temporary QR transfer token for a completed download job.
   * @param {string} jobId
   * @returns {Promise<object>}
   */
  async createTransfer(jobId) {
    const res = await apiClient.post('/transfer/create', { jobId });
    return res.data;
  },

  /**
   * Retrieves transfer details for the phone landing page.
   * @param {string} token
   * @returns {Promise<object>}
   */
  async getTransferInfo(token) {
    const res = await apiClient.get(`/transfer/${token}`);
    return res.data;
  },

  /**
   * Returns the direct download URL for a QR transfer token.
   * @param {string} token
   * @returns {string}
   */
  getTransferDownloadUrl(token) {
    return `${API_BASE_URL}/transfer/${token}/download`;
  }
};
