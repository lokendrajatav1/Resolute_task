// ✅ Compatible with BullMQ v5 and Node.js 22+ (ESM)
import pkg from 'bullmq';
const { Queue, Worker } = pkg;
import { redis } from '../config/redis.js';
import { log } from '../utils/logger.js';

export const emailQueue = new Queue('emails', { connection: redis });
export const orderQueue = new Queue('orders', { connection: redis });

export function startWorkers() {
  // Email worker
  new Worker(
    'emails',
    async (job) => {
      const { to, subject, html } = job.data;
      log.info(`📧 Email to ${to} – ${subject}`);
      return true;
    },
    { connection: redis }
  );

  // Order worker (delayed cancellation)
  new Worker(
    'orders',
    async (job) => {
      if (job.name === 'cancelUnpaid') {
        const { orderId } = job.data;
        const { cancelIfUnpaid } = await import('../controllers/order.controller.js');
        await cancelIfUnpaid(orderId);
        return true;
      }
    },
    { connection: redis }
  );

  log.info('✅ BullMQ workers started');
}
