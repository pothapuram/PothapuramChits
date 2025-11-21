# Google Sheets CRUD Manager

A JavaScript-based web application to perform Create, Read, Update, and Delete (CRUD) operations on Google Sheets data. The application displays different sheets as separate tables with navigation tabs, all built with vanilla JavaScript, HTML, and CSS.

## Features

✨ **Multiple Sheet Support** - Navigate between different sheets using tabs
📊 **Data Display** - View sheet data in clean, responsive tables
➕ **Create** - Add new rows to any sheet
✏️ **Update** - Edit existing rows with a modal form
🗑️ **Delete** - Remove rows with confirmation
🔄 **Refresh** - Reload data from Google Sheets
🎨 **Modern UI** - Beautiful gradient design with smooth animations
📱 **Responsive** - Works on desktop and mobile devices

## Project Structure

```
ChitsG_CRUD/
├── index.html      # Main HTML file with structure
├── styles.css      # Complete styling and responsive design
├── app.js          # Main application logic and Google Sheets API integration
├── config.js       # Configuration file for API credentials
└── README.md       # This file
```

## Setup Instructions

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google Sheets API**:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google Sheets API"
   - Click "Enable"

### 2. Create API Credentials

#### Create an API Key:
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy the API key

#### Create OAuth 2.0 Client ID:
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Configure the OAuth consent screen if prompted:
   - User Type: External
   - Add your email and app information
   - Add scope: `https://www.googleapis.com/auth/spreadsheets`
4. Application type: "Web application"
5. Add Authorized JavaScript origins:
   - For local development: `http://localhost:8000`
   - For production: Your domain URL
6. Copy the Client ID

### 3. Prepare Your Google Sheet

1. Create a new Google Sheet or use an existing one
2. Make sure the first row contains column headers (e.g., Name, Email, Phone, Address)
3. Copy the Spreadsheet ID from the URL:
   ```
   https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_HERE/edit
   ```

### 4. Configure the Application

1. Open `config.js`
2. Replace the placeholder values:
   ```javascript
   const API_KEY = 'your-actual-api-key';
   const CLIENT_ID = 'your-actual-client-id.apps.googleusercontent.com';
   const SPREADSHEET_ID = 'your-spreadsheet-id';
   ```

### 5. Run the Application

Since this application uses Google APIs, you need to run it through a web server (not by opening the HTML file directly).

#### Option 1: Using Python
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

#### Option 2: Using Node.js (http-server)
```bash
npx http-server -p 8000
```

#### Option 3: Using VS Code Live Server
1. Install the "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"

Then open your browser and navigate to `http://localhost:8000`

## Usage Guide

### First Time Setup
1. Open the application in your browser
2. Click the **"Authorize"** button
3. Sign in with your Google account
4. Grant permissions to access your spreadsheets

### Working with Data

#### View Data
- Sheet tabs appear at the top
- Click any tab to switch between sheets
- Data is displayed in a table format

#### Add New Row
1. Click the **"Add New Row"** button
2. Fill in the form fields
3. Click **"Save"**

#### Edit Row
1. Click the **"Edit"** button on any row
2. Modify the values in the form
3. Click **"Save"**

#### Delete Row
1. Click the **"Delete"** button on any row
2. Confirm the deletion

#### Refresh Data
- Click the **"Refresh Data"** button to reload the current sheet

#### Sign Out
- Click the **"Sign Out"** button to revoke access

## Google Sheets Format

Your Google Sheet should be structured as follows:

**Sheet 1: Customers**
| Name          | Email              | Phone          | Address        |
|---------------|-------------------|----------------|----------------|
| John Doe      | john@email.com    | 123-456-7890   | 123 Main St    |
| Jane Smith    | jane@email.com    | 098-765-4321   | 456 Oak Ave    |

**Sheet 2: Products**
| Product       | Price             | Stock          | Category       |
|---------------|-------------------|----------------|----------------|
| Laptop        | $999              | 50             | Electronics    |
| Phone         | $699              | 100            | Electronics    |

Each sheet will appear as a separate tab in the application.

## Troubleshooting

### "Error loading sheets"
- Check that your Spreadsheet ID is correct
- Verify that the Google Sheet is accessible
- Ensure the Google Sheets API is enabled in your project

### "Authorization failed"
- Verify your Client ID is correct
- Check that your domain is in the authorized JavaScript origins
- Clear browser cache and try again

### "Data not displaying"
- Ensure the sheet has headers in the first row
- Check browser console for error messages
- Verify your API Key is correct

### "CORS errors"
- Make sure you're running the app through a web server
- Do not open the HTML file directly (file://)

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Security Notes

⚠️ **Important**: 
- Never commit your `config.js` file with real credentials to public repositories
- Use environment variables or secure configuration management in production
- Consider adding `config.js` to `.gitignore`

## Technologies Used

- **HTML5** - Structure and markup
- **CSS3** - Styling and animations
- **Vanilla JavaScript** - Application logic
- **Google Sheets API v4** - Data operations
- **Google Identity Services** - Authentication

## Features Breakdown

### CRUD Operations
- **Create**: `addRow()` - Appends new data to the sheet
- **Read**: `loadSheetData()` - Fetches and displays data
- **Update**: `updateRow()` - Modifies existing row data
- **Delete**: `deleteRow()` - Removes rows from the sheet

### API Methods Used
- `spreadsheets.get` - Get spreadsheet metadata and sheet names
- `spreadsheets.values.get` - Read data from sheets
- `spreadsheets.values.append` - Add new rows
- `spreadsheets.values.update` - Update existing rows
- `spreadsheets.batchUpdate` - Delete rows

## License

This project is open source and available for personal and commercial use.

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the [Google Sheets API documentation](https://developers.google.com/sheets/api)
3. Check browser console for detailed error messages

---

**Happy Coding! 🚀**
