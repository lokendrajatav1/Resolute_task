import Joi from 'joi';
export const checkoutSchema = { body: Joi.object({}).optional() };
export const paySchema = { params: Joi.object({ id: Joi.string().hex().length(24).required() }), body: Joi.object({ mockTransactionId: Joi.string().optional(), transactionId: Joi.string().optional() }).or('mockTransactionId','transactionId') };
export const listOrders = { query: Joi.object({ page: Joi.number().min(1).default(1), limit: Joi.number().min(1).max(100).default(10) }) };
export const adminListOrders = { query: Joi.object({ page: Joi.number().min(1).default(1), limit: Joi.number().min(1).max(100).default(10), status: Joi.string().valid('PENDING_PAYMENT','PAID','SHIPPED','DELIVERED','CANCELLED').optional() }) };
export const adminUpdateStatus = { params: Joi.object({ id: Joi.string().hex().length(24).required() }), body: Joi.object({ status: Joi.string().valid('SHIPPED','DELIVERED','CANCELLED').required() }) };
