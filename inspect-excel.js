const { PrismaClient } = require('@prisma/client');
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

// Function to inspect Excel file
async function inspectExcelFile(fileName) {
  try {
    console.log(`Inspecting ${fileName}...`);
    
    const filePath = path.join(process.cwd(), fileName);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      return;
    }
    
    // Read Excel file
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    if (!data || data.length === 0) {
      console.error(`No data found in ${fileName}`);
      return;
    }
    
    console.log(`Found ${data.length} rows in ${fileName}`);
    
    // Display headers (column names)
    console.log('\nHeaders (column names):');
    console.log(Object.keys(data[0]));
    
    // Display first row as sample
    console.log('\nSample row:');
    console.log(JSON.stringify(data[0], null, 2));
    
    // Check for specific fields used in the import script
    const fieldsToCheck = ['HomeTeam', 'AwayTeam', 'Date', 'HTAG', 'HTHG', 
                          'HTOUHandicap', 'HTOverOdds', 'HTUnderOdds', 
                          'HTOddOdds', 'HTEvenOdds', 'HTBTTSYesOdds', 'HTBTTSNoOdds'];
    
    console.log('\nChecking for required fields:');
    fieldsToCheck.forEach(field => {
      const exists = data[0].hasOwnProperty(field);
      console.log(`${field}: ${exists ? 'Present' : 'Missing'}`);
    });
  } catch (error) {
    console.error('Error inspecting Excel file:', error);
  }
}

// Run the inspection for English.xlsx
inspectExcelFile('English.xlsx');