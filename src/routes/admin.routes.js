import { Router } from 'express';
import { adminListOrders, adminUpdateStatus } from '../controllers/order.controller.js';
import { auth } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';
import { validate } from '../middleware/validate.js';
import { adminListOrders as vList, adminUpdateStatus as vUpdate } from '../validators/order.schemas.js';

const r = Router();
r.use(auth, requireRole('ADMIN'));
r.get('/orders', validate(vList), adminListOrders);
r.patch('/orders/:id/status', validate(vUpdate), adminUpdateStatus);
export default r;
