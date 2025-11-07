import { badRequest } from '../utils/errors.js';

export const validate = (schema) => (req, res, next) => {
  const body = schema.body ? schema.body.validate(req.body, { abortEarly: false }) : { value: {} };
  const params = schema.params ? schema.params.validate(req.params, { abortEarly: false }) : { value: {} };
  const query = schema.query ? schema.query.validate(req.query, { abortEarly: false }) : { value: {} };
  const errors = [body.error, params.error, query.error].filter(Boolean);
  if (errors.length) {
    // Use ApiError so the global error handler returns correct status and details
    return next(badRequest('Validation failed', errors.map(e => e.details)));
  }
  req.validated = { body: body.value, params: params.value, query: query.value };
  next();
};
