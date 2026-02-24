import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.BACKEND_PORT || '3001', 10),
  apiPrefix: process.env.API_PREFIX || '/api/v1',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5175',
  jwtSecret: process.env.JWT_SECRET || 'erp-saas-default-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'erp-saas-refresh-secret-change-me',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  encryptionKey: process.env.ENCRYPTION_KEY || 'erp-saas-encryption-key-32-chars!',
  logLevel: process.env.LOG_LEVEL || 'debug',
}));
