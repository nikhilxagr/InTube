import { createApp } from './app.js';
import { config } from './config/config.js';
import { logger } from './utils/logger.js';
import { cleanupService } from './services/cleanup.service.js';

const app = createApp();

const server = app.listen(config.PORT, config.HOST, async () => {
  logger.info(
    {
      port: config.PORT,
      env: config.NODE_ENV,
      frontendUrl: config.FRONTEND_URL,
      tempDir: config.resolvedTempDir
    },
    `🚀 InTube backend server listening on http://${config.HOST === '0.0.0.0' ? 'localhost' : config.HOST}:${config.PORT}`
  );

  // Initial orphaned temp folder cleanup
  try {
    await cleanupService.sweepOrphanedTempDirs();
  } catch (err) {
    logger.warn({ err }, 'Failed initial temp folder sweep');
  }
});

// Graceful Shutdown
const handleShutdown = (signal) => {
  logger.info({ signal }, 'Received termination signal, shutting down gracefully...');
  server.close(() => {
    logger.info('HTTP server closed. Exiting process.');
    process.exit(0);
  });

  // Force close after 10s if sockets remain open
  setTimeout(() => {
    logger.error('Forced shutdown after timeout.');
    process.exit(1);
  }, 10000).unref();
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));
