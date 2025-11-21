// Google Sheets API Manager
class GoogleSheetsManager {
    constructor() {
        this.tokenClient = null;
        this.gapiInited = false;
        this.gisInited = false;
        this.currentSheet = null;
        this.sheets = [];
        this.currentData = [];
        this.currentHeaders = [];
        this.editingRowIndex = null;
    }

    // Initialize Google API
    async init() {
        await this.gapiLoaded();
        this.gisLoaded();
    }

    // Load GAPI client
    gapiLoaded() {
        return new Promise((resolve) => {
            gapi.load('client', async () => {
                await gapi.client.init({
                    apiKey: API_KEY,
                    discoveryDocs: [DISCOVERY_DOC],
                });
                this.gapiInited = true;
                this.maybeEnableButtons();
                resolve();
            });
        });
    }

    // Load GIS client
    gisLoaded() {
        this.tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: CLIENT_ID,
            scope: SCOPES,
            callback: '', // defined later
        });
        this.gisInited = true;
        this.maybeEnableButtons();
    }

    // Enable UI when APIs are ready
    maybeEnableButtons() {
        if (this.gapiInited && this.gisInited) {
            document.getElementById('authButton').style.display = 'block';
        }
    }

    // Handle authorization
    handleAuthClick() {
        this.tokenClient.callback = async (resp) => {
            if (resp.error !== undefined) {
                throw (resp);
            }
            document.getElementById('signoutButton').style.display = 'block';
            document.getElementById('authButton').style.display = 'none';
            await this.loadSheets();
        };

        if (gapi.client.getToken() === null) {
            this.tokenClient.requestAccessToken({ prompt: 'consent' });
        } else {
            this.tokenClient.requestAccessToken({ prompt: '' });
        }
    }

    // Handle sign out
    handleSignoutClick() {
        const token = gapi.client.getToken();
        if (token !== null) {
            google.accounts.oauth2.revoke(token.access_token);
            gapi.client.setToken('');
            document.getElementById('authButton').style.display = 'block';
            document.getElementById('signoutButton').style.display = 'none';
            document.getElementById('tableContainer').innerHTML = '<div class="loading">Please authorize to view data</div>';
            document.getElementById('sheetNav').innerHTML = '';
        }
    }

    // Load all sheets from the spreadsheet
    async loadSheets() {
        try {
            const response = await gapi.client.sheets.spreadsheets.get({
                spreadsheetId: SPREADSHEET_ID,
            });
            
            this.sheets = response.result.sheets.map(sheet => sheet.properties.title);
            this.renderSheetNav();
            
            if (this.sheets.length > 0) {
                this.currentSheet = this.sheets[0];
                await this.loadSheetData(this.currentSheet);
            }
        } catch (err) {
            console.error('Error loading sheets:', err);
            alert('Error loading sheets. Please check your Spreadsheet ID and permissions.');
        }
    }

    // Render sheet navigation tabs
    renderSheetNav() {
        const nav = document.getElementById('sheetNav');
        nav.innerHTML = '';
        
        this.sheets.forEach(sheetName => {
            const tab = document.createElement('button');
            tab.className = 'sheet-tab';
            tab.textContent = sheetName;
            if (sheetName === this.currentSheet) {
                tab.classList.add('active');
            }
            tab.addEventListener('click', () => this.switchSheet(sheetName));
            nav.appendChild(tab);
        });
    }

    // Switch between sheets
    async switchSheet(sheetName) {
        this.currentSheet = sheetName;
        this.renderSheetNav();
        await this.loadSheetData(sheetName);
    }

    // Load data from a specific sheet
    async loadSheetData(sheetName) {
        try {
            document.getElementById('loadingMessage').style.display = 'block';
            document.getElementById('dataTable').style.display = 'none';

            const response = await gapi.client.sheets.spreadsheets.values.get({
                spreadsheetId: SPREADSHEET_ID,
                range: `${sheetName}!A:Z`,
            });

            const values = response.result.values;
            if (values && values.length > 0) {
                this.currentHeaders = values[0];
                this.currentData = values.slice(1);
                this.renderTable();
            } else {
                this.showEmptyState();
            }
        } catch (err) {
            console.error('Error loading data:', err);
            alert('Error loading data from sheet.');
        }
    }

    // Render the data table
    renderTable() {
        const tableHead = document.getElementById('tableHead');
        const tableBody = document.getElementById('tableBody');
        
        // Render headers
        tableHead.innerHTML = '';
        const headerRow = document.createElement('tr');
        this.currentHeaders.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            headerRow.appendChild(th);
        });
        const actionsHeader = document.createElement('th');
        actionsHeader.textContent = 'Actions';
        headerRow.appendChild(actionsHeader);
        tableHead.appendChild(headerRow);

        // Render body
        tableBody.innerHTML = '';
        this.currentData.forEach((row, index) => {
            const tr = document.createElement('tr');
            
            this.currentHeaders.forEach((header, colIndex) => {
                const td = document.createElement('td');
                td.textContent = row[colIndex] || '';
                tr.appendChild(td);
            });

            // Actions column
            const actionsTd = document.createElement('td');
            actionsTd.className = 'action-buttons';
            
            const editBtn = document.createElement('button');
            editBtn.className = 'btn btn-warning';
            editBtn.textContent = 'Edit';
            editBtn.addEventListener('click', () => this.editRow(index));
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn btn-danger';
            deleteBtn.textContent = 'Delete';
            deleteBtn.addEventListener('click', () => this.deleteRow(index));
            
            actionsTd.appendChild(editBtn);
            actionsTd.appendChild(deleteBtn);
            tr.appendChild(actionsTd);
            
            tableBody.appendChild(tr);
        });

        document.getElementById('loadingMessage').style.display = 'none';
        document.getElementById('dataTable').style.display = 'table';
    }

    // Show empty state
    showEmptyState() {
        const container = document.getElementById('tableContainer');
        container.innerHTML = `
            <div class="empty-state">
                <h3>No Data Found</h3>
                <p>This sheet is empty. Click "Add New Row" to add data.</p>
            </div>
        `;
    }

    // Open modal for adding new row
    openAddModal() {
        this.editingRowIndex = null;
        document.getElementById('modalTitle').textContent = 'Add New Row';
        this.renderForm();
        document.getElementById('modal').style.display = 'block';
    }

    // Open modal for editing row
    editRow(index) {
        this.editingRowIndex = index;
        document.getElementById('modalTitle').textContent = 'Edit Row';
        this.renderForm(this.currentData[index]);
        document.getElementById('modal').style.display = 'block';
    }

    // Render form fields
    renderForm(data = null) {
        const formFields = document.getElementById('formFields');
        formFields.innerHTML = '';

        this.currentHeaders.forEach((header, index) => {
            const formGroup = document.createElement('div');
            formGroup.className = 'form-group';

            const label = document.createElement('label');
            label.textContent = header;
            label.setAttribute('for', `field_${index}`);

            const input = document.createElement('input');
            input.type = 'text';
            input.id = `field_${index}`;
            input.name = header;
            input.value = data && data[index] ? data[index] : '';

            formGroup.appendChild(label);
            formGroup.appendChild(input);
            formFields.appendChild(formGroup);
        });
    }

    // Handle form submission
    async handleSubmit(event) {
        event.preventDefault();
        
        const formData = [];
        this.currentHeaders.forEach((header, index) => {
            const input = document.getElementById(`field_${index}`);
            formData.push(input.value);
        });

        if (this.editingRowIndex !== null) {
            await this.updateRow(this.editingRowIndex, formData);
        } else {
            await this.addRow(formData);
        }

        this.closeModal();
    }

    // Add new row to sheet
    async addRow(data) {
        try {
            await gapi.client.sheets.spreadsheets.values.append({
                spreadsheetId: SPREADSHEET_ID,
                range: `${this.currentSheet}!A:Z`,
                valueInputOption: 'USER_ENTERED',
                resource: {
                    values: [data],
                },
            });

            await this.loadSheetData(this.currentSheet);
            alert('Row added successfully!');
        } catch (err) {
            console.error('Error adding row:', err);
            alert('Error adding row. Please try again.');
        }
    }

    // Update existing row
    async updateRow(index, data) {
        try {
            const rowNumber = index + 2; // +1 for 0-index, +1 for header row
            await gapi.client.sheets.spreadsheets.values.update({
                spreadsheetId: SPREADSHEET_ID,
                range: `${this.currentSheet}!A${rowNumber}:Z${rowNumber}`,
                valueInputOption: 'USER_ENTERED',
                resource: {
                    values: [data],
                },
            });

            await this.loadSheetData(this.currentSheet);
            alert('Row updated successfully!');
        } catch (err) {
            console.error('Error updating row:', err);
            alert('Error updating row. Please try again.');
        }
    }

    // Delete row from sheet
    async deleteRow(index) {
        if (!confirm('Are you sure you want to delete this row?')) {
            return;
        }

        try {
            const sheetId = await this.getSheetId(this.currentSheet);
            const rowNumber = index + 1; // +1 for header row

            await gapi.client.sheets.spreadsheets.batchUpdate({
                spreadsheetId: SPREADSHEET_ID,
                resource: {
                    requests: [{
                        deleteDimension: {
                            range: {
                                sheetId: sheetId,
                                dimension: 'ROWS',
                                startIndex: rowNumber,
                                endIndex: rowNumber + 1,
                            },
                        },
                    }],
                },
            });

            await this.loadSheetData(this.currentSheet);
            alert('Row deleted successfully!');
        } catch (err) {
            console.error('Error deleting row:', err);
            alert('Error deleting row. Please try again.');
        }
    }

    // Get sheet ID by name
    async getSheetId(sheetName) {
        const response = await gapi.client.sheets.spreadsheets.get({
            spreadsheetId: SPREADSHEET_ID,
        });
        const sheet = response.result.sheets.find(s => s.properties.title === sheetName);
        return sheet.properties.sheetId;
    }

    // Close modal
    closeModal() {
        document.getElementById('modal').style.display = 'none';
    }

    // Refresh current sheet data
    async refresh() {
        if (this.currentSheet) {
            await this.loadSheetData(this.currentSheet);
        }
    }
}

// Initialize the application
const manager = new GoogleSheetsManager();

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', async () => {
    await manager.init();

    // Event listeners
    document.getElementById('authButton').addEventListener('click', () => manager.handleAuthClick());
    document.getElementById('signoutButton').addEventListener('click', () => manager.handleSignoutClick());
    document.getElementById('addRowBtn').addEventListener('click', () => manager.openAddModal());
    document.getElementById('refreshBtn').addEventListener('click', () => manager.refresh());
    
    // Modal close events
    document.querySelector('.close').addEventListener('click', () => manager.closeModal());
    document.querySelector('.cancel-btn').addEventListener('click', () => manager.closeModal());
    
    // Click outside modal to close
    window.addEventListener('click', (event) => {
        const modal = document.getElementById('modal');
        if (event.target === modal) {
            manager.closeModal();
        }
    });

    // Form submission
    document.getElementById('dataForm').addEventListener('submit', (e) => manager.handleSubmit(e));
});
