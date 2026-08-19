import pino from 'pino';
import { config } from '../config/config.js';

export const logger = pino({
  level: config.LOG_LEVEL,
  transport: config.isDevelopment
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname'
        }
      }
    : undefined,
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'req.headers["set-cookie"]',
      'req.headers["x-auth-token"]',
      'req.headers["x-api-key"]',
      'url.search',
      'query',
      '*.token',
      '*.password',
      '*.secret',
      '*.key',
      '*.authorization'
    ],
    remove: true
  }
});
