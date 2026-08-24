import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger.js';
import { cleanupService } from './cleanup.service.js';

class JobService {
  constructor() {
    this.jobs = new Map();
    this.sweepInterval = globalThis.setInterval(() => this.cleanupStaleJobs(), 60000);
  }

  createJob(metadata = {}) {
    const jobId = uuidv4();
    const job = {
      jobId,
      status: 'initializing',
      percent: 0,
      speed: null,
      eta: null,
      downloaded: null,
      total: null,
      statusText: 'Starting download process...',
      stage: 'init',
      result: null,
      error: null,
      jobDir: null,
      metadata,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    this.jobs.set(jobId, job);
    return jobId;
  }

  getJob(jobId) {
    return this.jobs.get(jobId) || null;
  }

  updateProgress(jobId, progress) {
    const job = this.jobs.get(jobId);
    if (!job || job.status === 'completed' || job.status === 'error') return;

    Object.assign(job, {
      ...progress,
      updatedAt: Date.now()
    });
  }

  completeJob(jobId, result) {
    const job = this.jobs.get(jobId);
    if (!job) return;

    job.status = 'completed';
    job.percent = 100;
    job.statusText = 'Download complete! Preparing file for save...';
    job.result = result;
    job.jobDir = result?.jobDir || null;
    job.updatedAt = Date.now();
  }

  failJob(jobId, err) {
    const job = this.jobs.get(jobId);
    if (!job) return;

    job.status = 'error';
    job.error = typeof err === 'string' ? err : err.message || 'Download failed.';
    job.statusText = 'Download failed.';
    job.updatedAt = Date.now();
  }

  async removeJob(jobId) {
    const job = this.jobs.get(jobId);
    if (!job) return;

    if (job.jobDir) {
      await cleanupService.cleanDirectory(job.jobDir).catch(() => {});
    }

    this.jobs.delete(jobId);
  }

  cleanupStaleJobs() {
    const now = Date.now();
    const maxAge = 15 * 60 * 1000;

    for (const [jobId, job] of this.jobs.entries()) {
      if (now - job.createdAt > maxAge) {
        logger.debug({ jobId }, 'Purging expired job from memory');
        this.removeJob(jobId).catch(() => {});
      }
    }
  }
}

export const jobService = new JobService();
