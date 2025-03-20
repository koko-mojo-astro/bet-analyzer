const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const XLSX = require('xlsx')
const { PrismaClient } = require('@prisma/client')

// Initialize Prisma client
const prisma = new PrismaClient()

// Configure multer for file uploads
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		const uploadDir = path.join(process.cwd(), 'uploads')

		// Create uploads directory if it doesn't exist
		if (!fs.existsSync(uploadDir)) {
			fs.mkdirSync(uploadDir, { recursive: true })
		}

		cb(null, uploadDir)
	},
	filename: (req, file, cb) => {
		// Generate unique filename with original extension
		const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
		const ext = path.extname(file.originalname)
		cb(null, file.fieldname + '-' + uniqueSuffix + ext)
	},
})

// File filter to only allow xlsx and csv files
const fileFilter = (req, file, cb) => {
	const allowedFileTypes = ['.xlsx', '.csv']
	const ext = path.extname(file.originalname).toLowerCase()

	if (allowedFileTypes.includes(ext)) {
		cb(null, true)
	} else {
		cb(new Error('Only XLSX and CSV files are allowed'), false)
	}
}

const upload = multer({
	storage: storage,
	fileFilter: fileFilter,
	limits: { fileSize: 10 * 1024 * 1024 }, // 10MB file size limit
})

/**
 * @route   POST /api/upload-data
 * @desc    Upload and process match data
 * @access  Private (should be protected in production)
 */
router.post('/upload-data', upload.single('file'), async (req, res, next) => {
	try {
		// Check if file was uploaded
		if (!req.file) {
			return res.status(400).json({ error: 'No file uploaded' })
		}

		// Check if league was provided
		if (!req.body.league) {
			// Remove uploaded file if league is missing
			fs.unlinkSync(req.file.path)
			return res.status(400).json({ error: 'League is required' })
		}

		const league = req.body.league
		const filePath = req.file.path

		// Process the uploaded file
		const stats = await processUploadedFile(filePath, league)

		// Remove the temporary file after processing
		fs.unlinkSync(filePath)

		return res.status(200).json(stats)
	} catch (error) {
		// Clean up file if it exists and there was an error
		if (req.file && fs.existsSync(req.file.path)) {
			fs.unlinkSync(req.file.path)
		}

		console.error('Error processing upload:', error)
		next(error)
	}
})

/**
 * Process the uploaded file and import data
 */
async function processUploadedFile(filePath, league) {
	// Read the file with cellDates:true to properly parse dates
	const workbook = XLSX.readFile(filePath, { cellDates: true })
	const sheetName = workbook.SheetNames[0]
	const worksheet = workbook.Sheets[sheetName]

	// Convert to JSON with raw:false to ensure proper date conversion
	const data = XLSX.utils.sheet_to_json(worksheet, { raw: false })

	if (!data || data.length === 0) {
		throw new Error('No data found in the uploaded file')
	}

	console.log(
		`Processing ${data.length} matches from uploaded file for ${league}`
	)

	// Process the data
	return await processLeagueData(league, data)
}

/**
 * Process and insert league data
 */
async function processLeagueData(league, data) {
	// Track stats for reporting
	let processed = 0
	let skipped = 0

	for (const match of data) {
		try {
			// Extract home and away teams from the Match field
			const matchParts = match.Match ? match.Match.split(' vs ') : []
			const homeTeam = matchParts[0] || ''
			const awayTeam = matchParts[1] || ''

			// Extract halftime goals from Result field
			let homeHalfGoals = 0
			let awayHalfGoals = 0
			let homeFullGoals = 0
			let awayFullGoals = 0

			if (match.Result && match.Result.includes('HT:')) {
				const htScorePart = match.Result.split('HT:')[1].split(',')[0].trim()
				const htScores = htScorePart.split('-')
				homeHalfGoals = parseInt(htScores[0]) || 0
				awayHalfGoals = parseInt(htScores[1]) || 0
			}

			// Extract fulltime goals from Result field
			if (match.Result && match.Result.includes('FT:')) {
				const ftScorePart = match.Result.split('FT:')[1].trim()
				const ftScores = ftScorePart.split('-')
				homeFullGoals = parseInt(ftScores[0]) || 0
				awayFullGoals = parseInt(ftScores[1]) || 0
			}

			// Validate required fields before processing
			if (
				!homeTeam ||
				!awayTeam ||
				!match['Start Time'] ||
				isNaN(homeHalfGoals) ||
				isNaN(awayHalfGoals)
			) {
				console.log(
					`Skipping match with invalid data: ${JSON.stringify(match)}`
				)
				skipped++
				continue
			}

			// Parse the date properly
			let matchDate
			try {
				// Handle date string format from Excel
				matchDate = new Date(match['Start Time'])
				if (isNaN(matchDate.getTime())) {
					console.log(`Invalid date format: ${match['Start Time']}`)
					skipped++
					continue
				}
			} catch (error) {
				console.error(`Error parsing date: ${match['Start Time']}`, error)
				skipped++
				continue
			}

			// Extract match data - adjust field names based on actual Excel structure
			const matchData = {
				match: `${homeTeam} vs ${awayTeam}`,
				league: league,
				date: matchDate,
				halftimeGoals:
					match.Total_halftime_goals || homeHalfGoals + awayHalfGoals,
				homeHalfGoals: homeHalfGoals,
				awayHalfGoals: awayHalfGoals,
				fulltimeGoals: homeFullGoals + awayFullGoals,
				homeFullGoals: homeFullGoals,
				awayFullGoals: awayFullGoals,
				htouHcap: parseFloat(match.Htou_Hcap || 0.5),
				htou01: parseFloat(match.Htou_01 || 1.9),
				htou02: parseFloat(match.Htou_02 || 1.9),
				htoe01: parseFloat(match.Htoe_01 || 1.9),
				htoe02: parseFloat(match.Htoe_02 || 1.9),
				htbg01: parseFloat(match.Htbg_01 || 2.0),
				htbg02: parseFloat(match.Htbg_02 || 1.8),
				ouHcap: parseFloat(match.Ou_hcap || 2.5),
				ou01: parseFloat(match.Ou_01 || 1.9),
				ou02: parseFloat(match.Ou_02 || 1.9),
				oe01: parseFloat(match.Oe_01 || 1.9),
				oe02: parseFloat(match.Oe_02 || 1.9),
				bg01: parseFloat(match.Bg_01 || 1.9),
				bg02: parseFloat(match.Bg_02 || 1.9),
				homeTeam: homeTeam,
				awayTeam: awayTeam,
			}

			// Check if match already exists to avoid duplicates
			const existingMatch = await prisma.matchHistory.findFirst({
				where: {
					match: matchData.match,
					date: matchData.date,
				},
			})

			if (existingMatch) {
				skipped++
				continue
			}

			// Insert into database
			await prisma.matchHistory.create({
				data: matchData,
			})

			processed++
		} catch (error) {
			console.error(`Error processing match:`, error)
			skipped++
		}
	}

	console.log(
		`${league}: Processed ${processed} matches, skipped ${skipped} matches`
	)

	return { processed, skipped }
}

module.exports = router
