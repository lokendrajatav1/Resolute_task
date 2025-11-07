// ✅ Compatible with BullMQ v5 and Node.js 22+ (ESM)
import pkg from 'bullmq';
const { Queue, Worker } = pkg;
import { redis } from '../config/redis.js';
import { log } from '../utils/logger.js';
import { env } from '../config/env.js';

// If queues are disabled (local dev) provide safe no-op stubs so controllers
// can still call queue.add / getJob without throwing when Redis is down.
function makeNoopQueue(name) {
  return {
    name,
    add: async () => { log.info(`Queues disabled: skipping add to ${name}`); return null; },
    getJob: async () => null
  };
}

export const emailQueue = env.enableQueues ? new Queue('emails', { connection: redis }) : makeNoopQueue('emails');
export const orderQueue = env.enableQueues ? new Queue('orders', { connection: redis }) : makeNoopQueue('orders');

export function startWorkers() {
  if (!env.enableQueues) {
    log.info('Queues disabled via env; workers not started');
    return;
  }

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
