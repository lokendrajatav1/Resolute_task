import IORedis from 'ioredis';
import { env } from './env.js';

// ✅ BullMQ v5 requires maxRetriesPerRequest = null and enableReadyCheck = false
export const redis = new IORedis({
  host: env.redis.host || '127.0.0.1',
  port: Number(env.redis.port || 6379),
  password: env.redis.password || undefined,
  maxRetriesPerRequest: null, // ✅ Required for BullMQ v5
  enableReadyCheck: false      // ✅ Required for BullMQ v5
});
