const XLSX = require('xlsx')
const path = require('path')
const fs = require('fs')

// Function to test date parsing with different options
async function testDateParsing(fileName) {
	try {
		console.log(`Testing date parsing in ${fileName}...`)

		const filePath = path.join(process.cwd(), fileName)

		// Check if file exists
		if (!fs.existsSync(filePath)) {
			console.error(`File not found: ${filePath}`)
			return
		}

		// Test 1: Default options
		console.log('\nTest 1: Default options')
		const workbook1 = XLSX.readFile(filePath)
		const data1 = XLSX.utils.sheet_to_json(
			workbook1.Sheets[workbook1.SheetNames[0]]
		)
		console.log('Date value:', data1[0]['Start Time'])
		console.log('Date type:', typeof data1[0]['Start Time'])
		console.log('Converted to JS Date:', new Date(data1[0]['Start Time']))

		// Test 2: With cellDates: true
		console.log('\nTest 2: With cellDates: true')
		const workbook2 = XLSX.readFile(filePath, { cellDates: true })
		const data2 = XLSX.utils.sheet_to_json(
			workbook2.Sheets[workbook2.SheetNames[0]]
		)
		console.log('Date value:', data2[0]['Start Time'])
		console.log('Date type:', typeof data2[0]['Start Time'])
		if (data2[0]['Start Time'] instanceof Date) {
			console.log('Date object:', data2[0]['Start Time'].toISOString())
		}

		// Test 3: With cellDates: true and raw: false
		console.log('\nTest 3: With cellDates: true and raw: false')
		const workbook3 = XLSX.readFile(filePath, { cellDates: true })
		const data3 = XLSX.utils.sheet_to_json(
			workbook3.Sheets[workbook3.SheetNames[0]],
			{ raw: false }
		)
		console.log('Date value:', data3[0]['Start Time'])
		console.log('Date type:', typeof data3[0]['Start Time'])
		if (data3[0]['Start Time'] instanceof Date) {
			console.log('Date object:', data3[0]['Start Time'].toISOString())
		}
	} catch (error) {
		console.error('Error testing date parsing:', error)
	}
}

// Run the test for English.xlsx
testDateParsing(process.argv[2] || 'English.xlsx')
