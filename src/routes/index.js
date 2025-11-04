import { Router } from 'express';
import authRoutes from './auth.routes.js';
import productRoutes from './product.routes.js';
import cartRoutes from './cart.routes.js';
import orderRoutes from './order.routes.js';
import adminRoutes from './admin.routes.js';

const api = Router();
api.use('/auth', authRoutes);
api.use('/products', productRoutes);
api.use('/cart', cartRoutes);
api.use('/orders', orderRoutes);
api.use('/admin', adminRoutes);
export default api;
