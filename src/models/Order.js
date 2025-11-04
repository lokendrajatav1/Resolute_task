import mongoose from 'mongoose';
import { ORDER_STATUS } from '../utils/constants.js';

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1 },
  priceAtPurchase: { type: Number, required: true, min: 0 }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  items: { type: [orderItemSchema], required: true },
  totalAmount: { type: Number, required: true, min: 0 },
  status: { type: String, enum: Object.values(ORDER_STATUS), default: ORDER_STATUS.PENDING_PAYMENT, index: true },
  expiresAt: { type: Date, index: true }
}, { timestamps: true });

export const Order = mongoose.model('Order', orderSchema);
