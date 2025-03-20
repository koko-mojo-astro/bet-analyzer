const express = require('express')
const router = express.Router()

// Simple in-memory authentication for admin access
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'
let authTokens = {}

/**
 * Middleware to check if the request is authenticated
 */
const isAuthenticated = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]

  if (!token || !authTokens[token]) {
    return res.status(401).json({ error: 'Unauthorized access' })
  }

  // Add user info to request
  req.user = authTokens[token]
  next()
}

/**
 * @route   POST /api/admin/login
 * @desc    Login to access admin features
 * @access  Public
 */
router.post('/admin/login', async (req, res) => {
  try {
    const { password } = req.body

    if (!password || password !== ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Invalid password' })
    }

    // Generate a simple token
    const token =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)

    // Store token with user info
    authTokens[token] = { username: 'admin' }

    return res.status(200).json({ token })
  } catch (error) {
    console.error('Login error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

/**
 * @route   POST /api/admin/logout
 * @desc    Logout from admin session
 * @access  Private
 */
router.post('/admin/logout', isAuthenticated, (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]

  if (token && authTokens[token]) {
    delete authTokens[token]
  }

  return res.status(200).json({ message: 'Logged out successfully' })
})

module.exports = router