import mongoose from 'mongoose';
import { Product } from '../models/Product.js';
import { Cart } from '../models/Cart.js';
import { Order } from '../models/Order.js';
import { Payment } from '../models/Payment.js';
import { badRequest, notFound } from '../utils/errors.js';
import { parseQuery } from '../utils/pagination.js';
import { emailQueue, orderQueue } from '../jobs/queue.js';
import { ORDER_STATUS } from '../utils/constants.js';

const PAYMENT_DEADLINE_MIN = 15;

export async function checkout(req, res, next) {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const cart = await Cart.findOne({ userId: req.user.id }).lean();
    if (!cart || cart.items.length === 0) throw badRequest('Cart is empty');

    const products = await Product.find({ _id: { $in: cart.items.map(i => i.productId) } }).session(session);
    const priceMap = new Map(products.map(p => [p._id.toString(), p.price]));

    for (const item of cart.items) {
      const price = priceMap.get(item.productId.toString());
      if (price == null) throw badRequest('Invalid product in cart');
      const resv = await Product.updateOne(
        { _id: item.productId, $expr: { $gte: [{ $subtract: ['$totalStock', '$reservedStock'] }, item.quantity] } },
        { $inc: { reservedStock: item.quantity } }
      ).session(session);
      if (resv.modifiedCount !== 1) throw badRequest('Insufficient stock');
    }

    const items = cart.items.map(i => ({ productId: i.productId, quantity: i.quantity, priceAtPurchase: priceMap.get(i.productId.toString()) }));
    const totalAmount = items.reduce((sum, i) => sum + i.quantity * i.priceAtPurchase, 0);

    const expiresAt = new Date(Date.now() + PAYMENT_DEADLINE_MIN * 60 * 1000);
    const [order] = await Order.create([{ userId: req.user.id, items, totalAmount, status: ORDER_STATUS.PENDING_PAYMENT, expiresAt }], { session });

    await session.commitTransaction();
    session.endSession();

    await orderQueue.add('cancelUnpaid', { orderId: order._id.toString() }, { delay: PAYMENT_DEADLINE_MIN * 60 * 1000, jobId: order._id.toString(), removeOnComplete: true, removeOnFail: true });

    res.status(201).json(order);
  } catch (e) {
    await session.abortTransaction();
    session.endSession();
    next(e);
  }
}

export async function pay(req, res, next) {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const { id } = req.validated.params;
    const { mockTransactionId } = req.validated.body;

    const order = await Order.findOne({ _id: id, userId: req.user.id }).session(session);
    if (!order) throw notFound('Order not found');
    if (order.status !== ORDER_STATUS.PENDING_PAYMENT) throw badRequest('Order is not payable');

    for (const item of order.items) {
      const upd = await Product.updateOne(
        { _id: item.productId, reservedStock: { $gte: item.quantity } },
        { $inc: { reservedStock: -item.quantity, totalStock: -item.quantity } }
      ).session(session);
      if (upd.modifiedCount !== 1) throw badRequest('Stock finalization failed');
    }

    order.status = ORDER_STATUS.PAID;
    await order.save({ session });

    await Payment.create([{ orderId: order._id, transactionId: mockTransactionId, amount: order.totalAmount, status: 'SUCCESS' }], { session });

    await Cart.updateOne({ userId: req.user.id }, { $set: { items: [] } }).session(session);

    await session.commitTransaction();
    session.endSession();

    const job = await orderQueue.getJob(order._id.toString());
    if (job) await job.remove();

    await emailQueue.add('orderConfirmation', { to: req.user.email, subject: `Order ${order._id} confirmed`, html: `<p>Thanks ${req.user.name}! Your order is confirmed. Total: ${order.totalAmount}</p>` }, { removeOnComplete: true, removeOnFail: true });

    res.json({ ok: true, order });
  } catch (e) {
    await session.abortTransaction();
    session.endSession();
    next(e);
  }
}

export async function cancelIfUnpaid(orderId) {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const order = await Order.findById(orderId).session(session);
    if (!order) { await session.abortTransaction(); return; }
    if (order.status !== ORDER_STATUS.PENDING_PAYMENT) { await session.commitTransaction(); return; }

    for (const item of order.items) {
      const upd = await Product.updateOne(
        { _id: item.productId, reservedStock: { $gte: item.quantity } },
        { $inc: { reservedStock: -item.quantity } }
      ).session(session);
      if (upd.modifiedCount !== 1) throw new Error('Reservation release failed');
    }

    order.status = ORDER_STATUS.CANCELLED;
    await order.save({ session });

    await session.commitTransaction();
  } catch (e) {
    await session.abortTransaction();
    throw e;
  } finally {
    session.endSession();
  }
}

export async function getMyOrders(req, res, next) {
  try {
    const { page, limit, skip } = parseQuery(req.validated.query);
    const [items, total] = await Promise.all([
      Order.find({ userId: req.user.id }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Order.countDocuments({ userId: req.user.id })
    ]);
    res.json({ items, total, page, pages: Math.ceil(total / limit) });
  } catch (e) { next(e); }
}

export async function getOrderById(req, res, next) {
  try {
    const { id } = req.params;
    const order = await Order.findOne({ _id: id, userId: req.user.id }).lean();
    if (!order) return next(notFound('Order not found'));
    res.json(order);
  } catch (e) { next(e); }
}

export async function adminListOrders(req, res, next) {
  try {
    const { page, limit, skip } = parseQuery(req.validated.query);
    const { status } = req.validated.query;
    const filter = {};
    if (status) filter.status = status;
    const [items, total] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Order.countDocuments(filter)
    ]);
    res.json({ items, total, page, pages: Math.ceil(total / limit) });
  } catch (e) { next(e); }
}

export async function adminUpdateStatus(req, res, next) {
  try {
    const { id } = req.validated.params;
    const { status } = req.validated.body;
    const order = await Order.findById(id);
    if (!order) return next(notFound('Order not found'));
    order.status = status;
    await order.save();
    res.json(order);
  } catch (e) { next(e); }
}
