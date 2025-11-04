import { Router } from 'express';
import { getCart, addOrUpdateItem, removeItem } from '../controllers/cart.controller.js';
import { auth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { addOrUpdateItem as vAdd, removeItem as vRemove } from '../validators/cart.schemas.js';

const r = Router();
r.use(auth);
r.get('/', getCart);
r.post('/items', validate(vAdd), addOrUpdateItem);
r.delete('/items/:productId', validate(vRemove), removeItem);
export default r;
