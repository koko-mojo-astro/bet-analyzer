const jwt = require('jsonwebtoken')

// Middleware to authenticate JWT token
const authenticateToken = (req, res, next) => {
  // Get token from Authorization header
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN format

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' })
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
    req.user = decoded
    next()
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token.' })
  }
}

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'ADMIN') {
    next()
  } else {
    return res.status(403).json({ error: 'Access denied. Admin privileges required.' })
  }
}

module.exports = { authenticateToken, isAdmin }