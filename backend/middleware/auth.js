const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// Verify JWT token and attach user to request
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });

  const token = authHeader.split(' ')[1]; // Bearer <token>
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // attach decoded user info to request
    next();
  } catch (err) {
    console.error('JWT verification failed:', err.message);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// Verify admin role
function verifyAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

// Verify student role
function verifyStudent(req, res, next) {
  if (!req.user || req.user.role !== 'student') {
    return res.status(403).json({ error: 'Student access required' });
  }
  next();
}

// Verify student level access
function verifyStudentLevel(req, res, next) {
  const requestedLevel = parseInt(req.params.level || req.query.level || req.body.level);
  if (!requestedLevel) return next();

  const studentLevel = req.user.level;
  const accessibleLevels = req.user.accessible_levels || [];

  if (studentLevel === requestedLevel || accessibleLevels.includes(requestedLevel)) {
    return next();
  }

  return res.status(403).json({
    error: 'Access denied. You do not have permission to access this level.'
  });
}

module.exports = {
  verifyToken,
  verifyAdmin,
  verifyStudent,
  verifyStudentLevel,
};
