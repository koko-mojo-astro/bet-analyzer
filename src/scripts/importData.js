const { PrismaClient } = require('@prisma/client')
const XLSX = require('xlsx')
const path = require('path')
const fs = require('fs')

// Initialize Prisma client
const prisma = new PrismaClient()

// Define the leagues and their corresponding Excel files
const leagueFiles = [
	{ league: 'English Premier League', file: 'English.xlsx' },
	{ league: 'French Ligue 1', file: 'French.xlsx' },
	{ league: 'Italian Serie A', file: 'Italian.xlsx' },
	{ league: 'Spanish La Liga', file: 'Spanish.xlsx' },
	{ league: 'German Bundesliga', file: 'German.xlsx' },
	{ league: 'Dutch Eredivisie', file: 'Dutch.xlsx' },
	{ league: 'Japanese J1 League', file: 'Japanese.xlsx' },
	{ league: 'Swedish Allsvenskan', file: 'Swedish.xlsx' },
]

/**
 * Main function to import data from Excel files
 */
async function importData() {
	try {
		console.log('Starting data import process...')

		// Process each league file
		for (const { league, file } of leagueFiles) {
			console.log(`Processing ${league} data from ${file}...`)

			const filePath = path.join(process.cwd(), file)

			// Check if file exists
			if (!fs.existsSync(filePath)) {
				console.error(`File not found: ${filePath}`)
				continue
			}

			// Read Excel file with cellDates:true to properly parse dates
			const workbook = XLSX.readFile(filePath, { cellDates: true })
			const sheetName = workbook.SheetNames[0]
			const worksheet = workbook.Sheets[sheetName]

			// Convert to JSON with raw:false to ensure proper date conversion
			const data = XLSX.utils.sheet_to_json(worksheet, { raw: false })

			if (!data || data.length === 0) {
				console.error(`No data found in ${file}`)
				continue
			}

			console.log(`Found ${data.length} matches in ${file}`)

			// Process and insert data
			await processLeagueData(league, data)
		}

		console.log('Data import completed successfully!')
	} catch (error) {
		console.error('Error importing data:', error)
	} finally {
		await prisma.$disconnect()
	}
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
				isNaN(awayHalfGoals) ||
				isNaN(new Date(match['Start Time']).getTime())
			) {
				console.log(
					`Skipping match with invalid data: ${JSON.stringify(match)}`
				)
				skipped++
				continue
			}

			// Extract match data - adjust field names based on actual Excel structure
			const matchData = {
				match: `${homeTeam} vs ${awayTeam}`,
				league: league,
				date: new Date(match['Start Time']),
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

			// Log progress every 100 matches
			if (processed % 100 === 0) {
				console.log(`Processed ${processed} matches from ${league}`)
			}
		} catch (error) {
			console.error(`Error processing match:`, error)
			skipped++
		}
	}

	console.log(
		`${league}: Processed ${processed} matches, skipped ${skipped} matches`
	)
}

// Run the import
importData().catch(console.error)
