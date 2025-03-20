const XLSX = require('xlsx')
const path = require('path')
const fs = require('fs')

// Function to properly parse Excel dates
function parseExcelDate(excelDate) {
	// Excel dates are stored as days since 1900-01-01 (or 1904-01-01 in some cases)
	// XLSX.SSF.parse_date_code can convert the numeric value to a JS Date object
	if (typeof excelDate === 'number') {
		// Use XLSX date utilities to convert Excel serial date to JS Date
		return XLSX.SSF.parse_date_code(excelDate, { date1904: false })
	}

	// If it's already a string, try to parse it
	return new Date(excelDate)
}

// Function to inspect Excel file dates
async function inspectExcelDates(fileName) {
	try {
		console.log(`Inspecting dates in ${fileName}...`)

		const filePath = path.join(process.cwd(), fileName)

		// Check if file exists
		if (!fs.existsSync(filePath)) {
			console.error(`File not found: ${filePath}`)
			return
		}

		// Read Excel file with raw values to see the actual numeric values
		const workbook = XLSX.readFile(filePath, { cellDates: false, raw: true })
		const sheetName = workbook.SheetNames[0]
		const worksheet = workbook.Sheets[sheetName]

		// Get the raw data
		const rawData = XLSX.utils.sheet_to_json(worksheet, { raw: true })

		// Also read with dates converted
		const workbookWithDates = XLSX.readFile(filePath, { cellDates: true })
		const worksheetWithDates = workbookWithDates.Sheets[sheetName]
		const dataWithDates = XLSX.utils.sheet_to_json(worksheetWithDates, {
			raw: false,
		})

		if (!rawData || rawData.length === 0) {
			console.error(`No data found in ${fileName}`)
			return
		}

		console.log(`Found ${rawData.length} rows in ${fileName}`)

		// Find the date column
		const sampleRow = rawData[0]
		const dateColumn = Object.keys(sampleRow).find(
			(key) =>
				key.includes('Time') ||
				key.includes('Date') ||
				key.includes('time') ||
				key.includes('date')
		)

		if (!dateColumn) {
			console.error('Could not find a date column')
			return
		}

		console.log(`\nDate column found: ${dateColumn}`)

		// Display sample date values
		console.log('\nSample date values (first 5 rows):')
		for (let i = 0; i < Math.min(5, rawData.length); i++) {
			const rawValue = rawData[i][dateColumn]
			const dateValue = dataWithDates[i][dateColumn]

			console.log(`Row ${i + 1}:`)
			console.log(`  Raw value: ${rawValue} (type: ${typeof rawValue})`)
			console.log(`  Date value: ${dateValue} (type: ${typeof dateValue})`)

			// Try to parse the Excel date
			if (typeof rawValue === 'number') {
				const parsedDate = parseExcelDate(rawValue)
				console.log(`  Parsed date: ${parsedDate.toISOString()}`)
			}
			console.log('---')
		}

		// Check cell format in the worksheet
		const cellRef = XLSX.utils.encode_cell({
			r: 1,
			c: Object.keys(sampleRow).indexOf(dateColumn),
		})
		const cell = worksheet[cellRef]

		if (cell) {
			console.log('\nCell format information:')
			console.log(`  Cell reference: ${cellRef}`)
			console.log(`  Cell type: ${cell.t}`)
			console.log(`  Cell value: ${cell.v}`)
			console.log(`  Cell format string: ${cell.z || 'Not specified'}`)
		}
	} catch (error) {
		console.error('Error inspecting Excel dates:', error)
	}
}

// Run the inspection for English.xlsx
inspectExcelDates(process.argv[2] || 'English.xlsx')
