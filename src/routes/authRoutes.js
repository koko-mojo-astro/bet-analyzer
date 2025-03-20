const express = require('express')
const router = express.Router()
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')

// Initialize a local Prisma client as fallback
const prisma = new PrismaClient()
console.log('Local Prisma client initialized:', prisma ? 'Yes' : 'No')

// Ensure prisma client is properly initialized and accessible
if (!prisma) {
	console.error('Failed to initialize Prisma client')
	process.exit(1)
}

const { authenticateToken, isAdmin } = require('../middleware/auth')

// Register a new user (admin only)
router.post('/auth/register', authenticateToken, isAdmin, async (req, res) => {
	try {
		const { username, password, email } = req.body

		// Validate input
		if (!username || !password) {
			return res
				.status(400)
				.json({ error: 'Username and password are required' })
		}

		// Check if username already exists
		const existingUser = await req.prisma.user.findUnique({
			where: { username },
		})

		if (existingUser) {
			return res.status(400).json({ error: 'Username already exists' })
		}

		// Hash password
		const hashedPassword = await bcrypt.hash(password, 10)

		// Create user
		const newUser = await req.prisma.user.create({
			data: {
				username,
				password: hashedPassword,
				email,
				role: 'USER', // Default role
			},
		})

		// Remove password from response
		const { password: _, ...userWithoutPassword } = newUser

		res.status(201).json(userWithoutPassword)
	} catch (error) {
		console.error('Registration error:', error)
		res.status(500).json({ error: 'Failed to register user' })
	}
})

// Login
router.post('/auth/login', async (req, res) => {
	try {
		const { username, password } = req.body

		// Validate input
		if (!username || !password) {
			return res
				.status(400)
				.json({ error: 'Username and password are required' })
		}

		// Find user
		const user = await req.prisma.user.findUnique({
			where: { username },
		})

		if (!user) {
			return res.status(401).json({ error: 'Invalid credentials' })
		}

		// Check password
		const validPassword = await bcrypt.compare(password, user.password)

		if (!validPassword) {
			return res.status(401).json({ error: 'Invalid credentials' })
		}

		// Generate JWT token
		const token = jwt.sign(
			{ id: user.id, username: user.username, role: user.role },
			process.env.JWT_SECRET || 'your-secret-key',
			{ expiresIn: '24h' }
		)

		// Remove password from response
		const { password: _, ...userWithoutPassword } = user

		res.json({
			user: userWithoutPassword,
			token,
		})
	} catch (error) {
		console.error('Login error:', error)
		res.status(500).json({ error: 'Failed to login' })
	}
})

// Get current user
router.get('/auth/me', authenticateToken, async (req, res) => {
	try {
		const user = await req.prisma.user.findUnique({
			where: { id: req.user.id },
		})

		if (!user) {
			return res.status(404).json({ error: 'User not found' })
		}

		// Remove password from response
		const { password, ...userWithoutPassword } = user

		res.json(userWithoutPassword)
	} catch (error) {
		console.error('Get user error:', error)
		res.status(500).json({ error: 'Failed to get user information' })
	}
})

// Update password
router.post('/auth/update-password', authenticateToken, async (req, res) => {
	try {
		const { currentPassword, newPassword } = req.body

		// Validate input
		if (!currentPassword || !newPassword) {
			return res
				.status(400)
				.json({ error: 'Current and new passwords are required' })
		}

		// Find user
		const user = await req.prisma.user.findUnique({
			where: { id: req.user.id },
		})

		if (!user) {
			return res.status(404).json({ error: 'User not found' })
		}

		// Check current password
		const validPassword = await bcrypt.compare(currentPassword, user.password)

		if (!validPassword) {
			return res.status(401).json({ error: 'Current password is incorrect' })
		}

		// Hash new password
		const hashedPassword = await bcrypt.hash(newPassword, 10)

		// Update password
		await req.prisma.user.update({
			where: { id: req.user.id },
			data: { password: hashedPassword },
		})

		res.json({ message: 'Password updated successfully' })
	} catch (error) {
		console.error('Update password error:', error)
		res.status(500).json({ error: 'Failed to update password' })
	}
})

// Create initial admin user (for setup)
router.post('/auth/create-admin', async (req, res) => {
	try {
		const { adminKey, username, password, email } = req.body
		
		// Always use the local prisma instance which we know is initialized
		const db = prisma
		console.log('Using local Prisma client directly', db.user)
		
		// Verify the Prisma client is initialized
		if (!db) {
			console.error('Prisma client is not initialized')
			return res.status(500).json({ error: 'Database connection not available' })
		}

		// Special case for checking if admin exists
		if (adminKey === 'check-only' && username === 'check-only') {
			try {
				// Try a simple query to test the connection
				try {
					await db.$queryRaw`SELECT 1`
					console.log('Database connection test successful')
				} catch (connErr) {
					console.error('Database connection test failed:', connErr)
					return res.status(500).json({ error: 'Database connection test failed: ' + connErr.message })
				}

				// Just check if admin exists and return appropriate response
				const existingAdmin = await db.user.findFirst({
					select: { id: true },
					where: { role: 'ADMIN' }
				})

				if (existingAdmin) {
					return res.status(400).json({ error: 'Admin user already exists' })
				} else {
					return res.status(200).json({ message: 'No admin user exists yet' })
				}
			} catch (err) {
				console.error('Error checking admin existence:', err)
				return res.status(500).json({ error: 'Error checking admin existence: ' + err.message })
			}
		}

		// Validate required fields
		if (!adminKey || !username || !password || !email) {
			return res.status(400).json({ error: 'All fields are required' })
		}

		// Validate admin key (this should be a secure environment variable in production)
		if (adminKey !== process.env.ADMIN_SETUP_KEY) {
			return res.status(401).json({ error: 'Invalid admin setup key' })
		}

		// Try a simple query to test the connection
		try {
			await db.$queryRaw`SELECT 1`
			console.log('Database connection test successful for admin check')
		} catch (connErr) {
			console.error('Database connection test failed:', connErr)
			return res.status(500).json({ error: 'Database connection test failed: ' + connErr.message })
		}

		// Check if any admin already exists
		const existingAdmin = await db.user.findFirst({
			select: { id: true },
			where: { role: 'ADMIN' }
		})

		if (existingAdmin) {
			return res.status(400).json({ error: 'Admin user already exists' })
		}

		// Check if username already exists
		const existingUser = await db.user.findUnique({
			select: { id: true },
			where: { username }
		})

		if (existingUser) {
			return res.status(400).json({ error: 'Username already exists' })
		}

		// Validate password length
		if (password.length < 8) {
			return res
				.status(400)
				.json({ error: 'Password must be at least 8 characters long' })
		}

		// Validate email format
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
		if (!emailRegex.test(email)) {
			return res.status(400).json({ error: 'Invalid email format' })
		}

		// Hash password
		const hashedPassword = await bcrypt.hash(password, 10)

		// Create admin user
		const admin = await db.user.create({
			data: {
				username,
				password: hashedPassword,
				email,
				role: 'ADMIN',
			},
			select: {
				id: true,
				username: true,
				email: true,
				role: true,
				password: true
			}
		})

		// Remove password from response
		const { password: _, ...adminWithoutPassword } = admin

		res.status(201).json(adminWithoutPassword)
	} catch (error) {
		console.error('Create admin error:', error)
		res
			.status(500)
			.json({ error: 'Failed to create admin user: ' + error.message })
	}
})

// Password reset request
router.post('/auth/forgot-password', async (req, res) => {
	try {
		const { email } = req.body

		if (!email) {
			return res.status(400).json({ error: 'Email is required' })
		}

		const user = await req.prisma.user.findUnique({ where: { email } })

		if (!user) {
			return res.status(404).json({ error: 'User not found' })
		}

		// Generate reset token with 1-hour expiration
		const resetToken = crypto.randomBytes(20).toString('hex')
		const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hour

		await req.prisma.user.update({
			where: { id: user.id },
			data: {
				resetToken,
				resetTokenExpiry,
			},
		})

		const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`

		// In a real app, you would send an email here
		console.log('Password reset link:', resetLink)

		res.json({ message: 'Password reset email sent' })
	} catch (error) {
		console.log('Failed ', error)
		res.status(500).json({ error: 'Failed to process password reset request' })
	}
})

module.exports = router
