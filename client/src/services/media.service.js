import { apiClient } from './api.js';

export const MediaService = {
  /**
   * Checks the server health status
   */
  async getHealth() {
    return apiClient.get('/health');
  },

  /**
   * Analyzes a media URL
   * @param {string} url
   */
  async analyze(url) {
    return apiClient.post('/media/analyze', { url });
  },

  /**
   * Initiates media download request
   * @param {object} payload
   * @param {string} payload.url
   * @param {string} payload.formatId
   * @param {string} [payload.container]
   * @param {string} [payload.type]
   */
  async download(payload) {
    return apiClient.post('/media/download', payload);
  }
};
