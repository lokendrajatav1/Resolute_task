import { Router } from 'express';
import { checkout, pay, getMyOrders, getOrderById } from '../controllers/order.controller.js';
import { auth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { checkoutSchema, paySchema, listOrders } from '../validators/order.schemas.js';

const r = Router();
r.use(auth);
r.post('/checkout', validate(checkoutSchema), checkout);
r.post('/:id/pay', validate(paySchema), pay);
r.get('/', validate(listOrders), getMyOrders);
r.get('/:id', getOrderById);
export default r;
