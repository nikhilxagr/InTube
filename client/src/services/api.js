import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000, // 2 minutes for processing
  headers: {
    'Accept': 'application/json, video/*, audio/*, image/*'
  }
});

// Response interceptor to handle data unwrap and binary error decoding
apiClient.interceptors.response.use(
  (response) => {
    // If it's a binary blob download response, return full response to read headers
    if (response.config.responseType === 'blob') {
      return response;
    }
    return response.data;
  },
  async (error) => {
    let errorPayload = {
      code: 'NETWORK_ERROR',
      message: 'Unable to connect to server. Please ensure the backend is running.'
    };

    // If server responded with error blob (when responseType was 'blob')
    if (error.response?.data instanceof Blob) {
      try {
        const text = await error.response.data.text();
        const json = JSON.parse(text);
        if (json.error) {
          errorPayload = json.error;
        }
      } catch {
        errorPayload.message = error.message || 'Media processing error occurred.';
      }
    } else if (error.response?.data?.error) {
      errorPayload = error.response.data.error;
    } else if (error.message) {
      errorPayload.message = error.message;
    }

    return Promise.reject(errorPayload);
  }
);
