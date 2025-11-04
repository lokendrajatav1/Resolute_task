import { Router } from 'express';
import { createProduct, updateProduct, deleteProduct, listProducts } from '../controllers/product.controller.js';
import { auth } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';
import { validate } from '../middleware/validate.js';
import { createProduct as vCreate, updateProduct as vUpdate, listProducts as vList, productIdParam } from '../validators/product.schemas.js';

const r = Router();
r.get('/', validate(vList), listProducts);
r.post('/', auth, requireRole('ADMIN'), validate(vCreate), createProduct);
r.put('/:id', auth, requireRole('ADMIN'), validate(vUpdate), updateProduct);
r.delete('/:id', auth, requireRole('ADMIN'), validate(productIdParam), deleteProduct);
export default r;
