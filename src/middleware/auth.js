import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { unauthorized } from '../utils/errors.js';
import { User } from '../models/User.js';

export async function auth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) throw unauthorized('Missing token');
    const payload = jwt.verify(token, env.jwtSecret);
    const user = await User.findById(payload.sub).lean();
    if (!user) throw unauthorized('Invalid token');
    req.user = { id: user._id.toString(), role: user.role, email: user.email, name: user.name };
    next();
  } catch (e) {
    next(unauthorized('Invalid or expired token'));
  }
}
