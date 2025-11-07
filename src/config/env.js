import 'dotenv/config';

// Provide sensible local defaults so the app can run without a .env in dev.
// IMPORTANT: Change these values in production using environment variables.
export const env = {
  port: Number(process.env.PORT || 3000),
  nodeEnv: process.env.NODE_ENV || 'development',
  // default to local MongoDB for quick local runs
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/advanced-ecommerce',
  // WARNING: fallback secret for dev only
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
  jwtExpires: process.env.JWT_EXPIRES || '7d',
  redis: {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: Number(process.env.REDIS_PORT || 6379),
    password: process.env.REDIS_PASSWORD || undefined
  },
  // Feature toggles for local development
  enableQueues: process.env.ENABLE_QUEUES !== 'false',
  disableTransactions: process.env.DISABLE_TRANSACTIONS === 'true',
  email: {
    host: process.env.SMTP_HOST || 'localhost',
    port: Number(process.env.SMTP_PORT || 1025),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.EMAIL_FROM || 'Shop <noreply@example.com>'
  }
};
