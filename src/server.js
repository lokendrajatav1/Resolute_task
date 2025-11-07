import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import { connectDb } from './config/db.js';
import { env } from './config/env.js';
import api from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import mongoose from 'mongoose';
import { redis } from './config/redis.js';
import { startWorkers } from './jobs/queue.js';

const app = express();
app.use(cors());
app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

app.get('/', (req, res) => res.json({ ok: true, name: 'advanced-ecommerce-api' }));
app.use('/', api);
app.use(errorHandler);

// Health endpoint to help debug local setup (Mongo, Redis, transactions)
app.get('/health', async (req, res) => {
  const mongoConnected = mongoose.connection && mongoose.connection.readyState === 1;
  let redisOk = null;
  if (env.enableQueues) {
    try { const p = await redis.ping(); redisOk = p === 'PONG'; } catch (e) { redisOk = false; }
  }
  const desc = mongoose.connection && mongoose.connection.client && mongoose.connection.client.topology && mongoose.connection.client.topology.description;
  const topologyType = desc && desc.type ? String(desc.type).toLowerCase() : '';
  const txSupported = topologyType.includes('replicaset') || topologyType.includes('sharded');
  res.json({ ok: true, mongoConnected, redis: redisOk, transactionsSupported: txSupported, queuesEnabled: env.enableQueues, transactionsDisabledByEnv: env.disableTransactions });
});

try {
  await connectDb();
  startWorkers();
  app.listen(env.port, () => {
    console.log(`🚀 Server listening on http://localhost:${env.port}`);
  });
} catch (err) {
  console.error('Failed to start application:', err && err.message ? err.message : err);
  // Give the log a bit of time to flush, then exit
  process.exit(1);
}
