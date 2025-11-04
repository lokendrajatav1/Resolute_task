import Joi from 'joi';
export const registerSchema = { body: Joi.object({ name: Joi.string().min(2).max(120).required(), email: Joi.string().email().required(), password: Joi.string().min(8).required() }) };
export const loginSchema = { body: Joi.object({ email: Joi.string().email().required(), password: Joi.string().required() }) };
