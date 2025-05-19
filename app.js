// Store sheet data globally
let sheets = [];

// Function to read Excel file from static path
async function loadExcelFile() {
    try {
        // Load file from static path
        const response = await fetch('Sample.xlsx');
        const arrayBuffer = await response.arrayBuffer();
        
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });

        // Clear existing sheets
        document.getElementById('sheet-container').innerHTML = '';
        document.querySelector('.navbar').innerHTML = '';

        // Process each sheet
        const sheetNames = workbook.SheetNames;
        sheetNames.forEach((sheetName, index) => {
            const worksheet = workbook.Sheets[sheetName];
            const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            
            // Store sheet data
            sheets[index] = json;
            
            // Add sheet name to navbar
            const navLink = document.createElement('a');
            navLink.href = '#';
            navLink.textContent = sheetName;
            navLink.dataset.sheet = index;
            navLink.onclick = (e) => {
                e.preventDefault();
                showSheet(index);
            };
            document.querySelector('.navbar').appendChild(navLink);
        });
        
        // Show first sheet by default
        showSheet(0);
    } catch (error) {
        console.error('Error loading Excel file:', error);
    }
}

// Function to display sheet data in a table
function showSheet(sheetIndex) {
    const container = document.getElementById('sheet-container');
    const data = sheets[sheetIndex];
    
    if (!data || data.length === 0) return;
    
    // Create table
    const table = document.createElement('table');
    const headerRow = table.insertRow();
    
    // Create header row
    data[0].forEach((header, colIndex) => {
        const th = document.createElement('th');
        th.textContent = header;
        headerRow.appendChild(th);
    });
    
    // Create data rows
    for (let i = 1; i < data.length; i++) {
        const row = table.insertRow();
        data[i].forEach((cell, colIndex) => {
            const td = document.createElement('td');
            td.textContent = cell;
            row.appendChild(td);
        });
    }
    
    container.innerHTML = '';
    container.appendChild(table);
}

// Load file when page loads
window.onload = loadExcelFile;