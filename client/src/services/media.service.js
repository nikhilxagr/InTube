import { apiClient, API_BASE_URL } from './api.js';

export const MediaService = {
  async getHealth() {
    return apiClient.get('/health');
  },

  async analyze(url) {
    return apiClient.post('/media/analyze', { url });
  },

  async download(payload, onProgress) {
    const baseUrl = API_BASE_URL.replace(/\/+$/, '');
    const startRes = await fetch(`${baseUrl}/media/job`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!startRes.ok) {
      const errData = await startRes.json().catch(() => ({}));
      throw new Error(errData.error?.message || `Failed to start download job (HTTP ${startRes.status})`);
    }

    const { data: { jobId } } = await startRes.json();

    if (onProgress) {
      onProgress({
        status: 'downloading',
        percent: 1,
        statusText: 'Connecting to video stream...'
      });
    }

    return new Promise((resolve, reject) => {
      let isSettled = false;

      const pollInterval = setInterval(async () => {
        try {
          const pollRes = await fetch(`${baseUrl}/media/job/${jobId}/progress`);
          if (!pollRes.ok) {
            clearInterval(pollInterval);
            if (!isSettled) {
              isSettled = true;
              reject(new Error('Failed to track download progress from server.'));
            }
            return;
          }

          const { data: job } = await pollRes.json();

          if (onProgress) {
            onProgress({
              status: job.status,
              percent: job.percent,
              total: job.total,
              speed: job.speed,
              eta: job.eta,
              statusText: job.statusText
            });
          }

          if (job.status === 'completed') {
            clearInterval(pollInterval);
            if (!isSettled) {
              isSettled = true;

              const fileUrl = `${baseUrl}/media/job/${jobId}/file`;
              const link = document.createElement('a');
              link.href = fileUrl;
              link.setAttribute('download', job.filename || 'media.mp4');
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);

              resolve({ success: true, filename: job.filename || 'media.mp4' });
            }
          } else if (job.status === 'error') {
            clearInterval(pollInterval);
            if (!isSettled) {
              isSettled = true;
              reject(new Error(job.error || 'Server processing failed for this video.'));
            }
          }
        } catch (err) {
          clearInterval(pollInterval);
          if (!isSettled) {
            isSettled = true;
            reject(err);
          }
        }
      }, 250);
    });
  }
};
