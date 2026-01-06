const XLSX = require('xlsx');
const path = require('path');

const filePath = 'd:/Projetos/Agent-Company/analise/Cópia de HOTEL MUNDIAL - Fase 2_V2.xlsx';

try {
    console.log(`Reading file: ${filePath}`);
    const workbook = XLSX.readFile(filePath);
    console.log('Sheets found:', workbook.SheetNames);

    workbook.SheetNames.forEach(sheetName => {
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        console.log(`\n--- Sheet: ${sheetName} ---`);
        console.log(`Total rows: ${data.length}`);

        // Get first 50 rows to better understand headers and structure
        console.log('Sample data (Rows 1-50):');
        data.slice(0, 50).forEach((row, idx) => {
            console.log(`${idx + 1}:`, JSON.stringify(row));
        });
    });
} catch (error) {
    console.error('Error reading file:', error);
}
