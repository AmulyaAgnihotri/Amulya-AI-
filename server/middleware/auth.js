import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'amulya-ai-secret-key-change-in-production';

/**
 * Auth middleware — verifies JWT from Authorization header.
 * Sets req.user = { id, email } if valid.
 * If no token, continues as guest (req.user = null).
 */
export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = { id: decoded.id, email: decoded.email };
    next();
  } catch {
    req.user = null;
    next();
  }
}

/**
 * Strict auth — returns 401 if not authenticated.
 */
export function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required.' });
  }
  next();
}

/**
 * Generate a JWT token.
 */
export function generateToken(user) {
  return jwt.sign(
    { id: user._id, email: user.email },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
}

export { JWT_SECRET };
