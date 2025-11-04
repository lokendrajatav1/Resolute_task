import Joi from 'joi';
export const createProduct = { body: Joi.object({ name: Joi.string().min(1).required(), price: Joi.number().min(0).required(), description: Joi.string().allow('').optional(), totalStock: Joi.number().integer().min(0).required() }) };
export const updateProduct = { params: Joi.object({ id: Joi.string().hex().length(24).required() }), body: Joi.object({ name: Joi.string().min(1), price: Joi.number().min(0), description: Joi.string().allow(''), totalStock: Joi.number().integer().min(0) }).min(1) };
export const productIdParam = { params: Joi.object({ id: Joi.string().hex().length(24).required() }) };
export const listProducts = { query: Joi.object({ page: Joi.number().min(1).default(1), limit: Joi.number().min(1).max(100).default(10), sortBy: Joi.string().valid('price','name','-price','-name').default('name'), name: Joi.string().allow('').optional() }) };
