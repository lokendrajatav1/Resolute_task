import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', index: true },
  transactionId: { type: String, required: true },
  amount: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['SUCCESS','FAILED'], required: true }
}, { timestamps: true });

export const Payment = mongoose.model('Payment', paymentSchema);
