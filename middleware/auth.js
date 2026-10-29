import jwt from 'jsonwebtoken';

// Authentication middleware (P7)
// Reads Authorization: Bearer <token>, verifies JWT inside try/catch,
// attaches decoded user to req.user, and returns 401 JSON on missing or invalid token.
export function protect(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({ error: 'Authorization token missing' });
    }

    const secret = process.env.JWT_SECRET || 'development-secret-change-me';
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export default protect;
