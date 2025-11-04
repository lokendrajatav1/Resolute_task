import { Cart } from '../models/Cart.js';
import mongoose from 'mongoose';

export async function getCart(req, res, next) {
  try {
    let cart = await Cart.findOne({ userId: req.user.id }).lean();
    if (!cart) cart = await Cart.create({ userId: req.user.id, items: [] });
    res.json(cart);
  } catch (e) { next(e); }
}

export async function addOrUpdateItem(req, res, next) {
  try {
    const { productId, quantity } = req.validated.body;
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const cart = await Cart.findOneAndUpdate(
      { userId, 'items.productId': productId },
      { $set: { 'items.$.quantity': quantity } },
      { new: true }
    );
    if (cart) return res.json(cart);

    const updated = await Cart.findOneAndUpdate(
      { userId },
      { $push: { items: { productId, quantity } } },
      { upsert: true, new: true }
    );
    res.json(updated);
  } catch (e) { next(e); }
}

export async function removeItem(req, res, next) {
  try {
    const { productId } = req.validated.params;
    const updated = await Cart.findOneAndUpdate(
      { userId: req.user.id },
      { $pull: { items: { productId } } },
      { new: true }
    );
    res.json(updated);
  } catch (e) { next(e); }
}
