import express from 'express';
import User from '../models/User.js';
import { generateToken, requireAuth, authMiddleware } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/auth/register
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const user = await User.create({ name, email: email.toLowerCase(), password });
    const token = generateToken(user);

    res.status(201).json({ user: user.toJSON(), token });
  } catch (error) {
    console.error('Register error:', error.message);
    res.status(500).json({ error: 'Registration failed.' });
  }
});

/**
 * POST /api/auth/login
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = generateToken(user);
    res.json({ user: user.toJSON(), token });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ error: 'Login failed.' });
  }
});

/**
 * GET /api/auth/me — Get current user profile
 */
router.get('/me', authMiddleware, requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json({ user: user.toJSON() });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile.' });
  }
});

/**
 * PUT /api/auth/settings — Update user settings
 */
router.put('/settings', authMiddleware, requireAuth, async (req, res) => {
  try {
    const { systemPrompt, syntaxTheme, githubToken, name } = req.body;
    const update = {};
    if (name !== undefined) update.name = name;
    if (systemPrompt !== undefined) update['settings.systemPrompt'] = systemPrompt;
    if (syntaxTheme !== undefined) update['settings.syntaxTheme'] = syntaxTheme;
    if (githubToken !== undefined) update['settings.githubToken'] = githubToken;

    const user = await User.findByIdAndUpdate(req.user.id, { $set: update }, { new: true });
    res.json({ user: user.toJSON() });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update settings.' });
  }
});

export default router;
