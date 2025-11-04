import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { env } from '../config/env.js';
import { badRequest, unauthorized } from '../utils/errors.js';

export async function register(req, res, next) {
  try {
    const { name, email, password } = req.validated.body;
    const exists = await User.findOne({ email });
    if (exists) return next(badRequest('Email already in use'));
    const user = await User.create({ name, email, password });
    res.status(201).json({ id: user._id, email: user.email });
  } catch (e) { next(e); }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.validated.body;
    const user = await User.findOne({ email });
    if (!user) return next(unauthorized('Invalid credentials'));
    const ok = await user.comparePassword(password);
    if (!ok) return next(unauthorized('Invalid credentials'));
    const token = jwt.sign({ sub: user._id, role: user.role }, env.jwtSecret, { expiresIn: env.jwtExpires });
    res.json({ token });
  } catch (e) { next(e); }
}
