import { Product } from '../models/Product.js';
import { parseQuery } from '../utils/pagination.js';
import { notFound } from '../utils/errors.js';

export async function createProduct(req, res, next) {
  try {
    const doc = await Product.create(req.validated.body);
    res.status(201).json(doc);
  } catch (e) { next(e); }
}

export async function updateProduct(req, res, next) {
  try {
    const { id } = req.validated.params;
    const doc = await Product.findByIdAndUpdate(id, req.validated.body, { new: true });
    if (!doc) return next(notFound('Product not found'));
    res.json(doc);
  } catch (e) { next(e); }
}

export async function deleteProduct(req, res, next) {
  try {
    const { id } = req.validated.params;
    const doc = await Product.findByIdAndDelete(id);
    if (!doc) return next(notFound('Product not found'));
    res.json({ ok: true });
  } catch (e) { next(e); }
}

export async function listProducts(req, res, next) {
  try {
    const { page, limit, skip } = parseQuery(req.validated.query);
    const { name, sortBy } = req.validated.query;
    const filter = {};
    if (name) filter.name = { $regex: name, $options: 'i' };
    const sort = sortBy?.startsWith('-') ? { [sortBy.slice(1)]: -1 } : { [sortBy]: 1 };
    const [items, total] = await Promise.all([
      Product.find(filter).sort(sort).skip(skip).limit(limit).lean(),
      Product.countDocuments(filter)
    ]);
    res.json({ items, total, page, pages: Math.ceil(total / limit) });
  } catch (e) { next(e); }
}
