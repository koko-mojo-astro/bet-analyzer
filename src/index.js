require('dotenv').config()
const express = require('express')
const cors = require('cors')
const { PrismaClient } = require('@prisma/client')
const Redis = require('redis')

// Import routes
const betRoutes = require('./routes/betRoutes')
const uploadRoutes = require('./routes/uploadRoutes')
const goalPredictionRoutes = require('./routes/goalPredictionRoutes')
const fulltimeGoalRoutes = require('./routes/fulltimeGoalRoutes')
const verifiedResultsRoutes = require('./routes/verifiedResultsRoutes')
const authRoutes = require('./routes/authRoutes')

// Initialize Express app
const app = express()
const prisma = new PrismaClient()
const PORT = process.env.PORT || 3005

// Middleware
app.use(cors())
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

// Add header size limit to fix 431 error
// Middleware for handling large requests
app.use((req, res, next) => {
	// We're now handling header size at the HTTP server level
	next()
})

// Initialize Redis client (optional)
// If REDIS_URL is not defined in .env, Redis functionality will be disabled
// and the application will work without caching
let redisClient
if (process.env.REDIS_URL) {
	console.log('Redis URL found, initializing Redis client...')
	redisClient = Redis.createClient({
		url: process.env.REDIS_URL,
	})

	redisClient.on('error', (err) => {
		console.error('Redis error:', err)
	})

	redisClient.connect().catch(console.error)
} else {
	console.log('Redis URL not found, running without Redis caching...')
}

// Make Prisma and Redis clients available to routes
app.use((req, res, next) => {
	req.prisma = prisma
	if (redisClient) {
		req.redis = redisClient
	}
	next()
})

// Routes
// Register routes
app.use('/api', authRoutes)
app.use('/api', betRoutes)
app.use('/api', uploadRoutes)
app.use('/api', goalPredictionRoutes)
app.use('/api', fulltimeGoalRoutes)
app.use('/api', verifiedResultsRoutes)

// Health check endpoint
app.get('/health', (req, res) => {
	res.status(200).json({ status: 'ok' })
})

// Error handling middleware
app.use((err, req, res, next) => {
	console.error(err.stack)
	res.status(500).json({
		error: 'Internal Server Error',
		message: process.env.NODE_ENV === 'development' ? err.message : undefined,
	})
})

// Start server
const server = require('http').createServer({ maxHeadersCount: 100 }, app)
server.listen(PORT, () => {
	console.log(`Server running on port ${PORT} GGWP`)
})

// Handle graceful shutdown
process.on('SIGINT', async () => {
	console.log('Shutting down gracefully...')
	await prisma.$disconnect()
	if (redisClient) {
		await redisClient.quit()
	}
	process.exit(0)
})
