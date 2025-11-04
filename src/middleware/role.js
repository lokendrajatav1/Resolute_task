import { forbidden } from '../utils/errors.js';
export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) return next(forbidden('Insufficient permissions'));
  next();
};
