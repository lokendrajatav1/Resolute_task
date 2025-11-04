import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import { connectDb } from './config/db.js';
import { env } from './config/env.js';
import api from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { startWorkers } from './jobs/queue.js';

const app = express();
app.use(cors());
app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

app.get('/', (req, res) => res.json({ ok: true, name: 'advanced-ecommerce-api' }));
app.use('/', api);
app.use(errorHandler);

await connectDb();
startWorkers();

app.listen(env.port, () => {
  console.log(`🚀 Server listening on http://localhost:${env.port}`);
});
