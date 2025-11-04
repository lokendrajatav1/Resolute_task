import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, index: true },
  price: { type: Number, required: true, min: 0 },
  description: { type: String },
  totalStock: { type: Number, required: true, min: 0 },
  reservedStock: { type: Number, required: true, min: 0, default: 0 }
}, { timestamps: true });

productSchema.virtual('availableStock').get(function(){
  return Math.max(0, this.totalStock - this.reservedStock);
});

export const Product = mongoose.model('Product', productSchema);
