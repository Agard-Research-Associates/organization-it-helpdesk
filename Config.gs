/**
 * School IT Help Desk - Configuration & Setup
 * Open source under MIT License
 * 
 * INSTRUCTIONS:
 * 1. Run setupSpreadsheet() once to create the backing Google Sheet.
 * 2. Copy the Sheet ID from the URL and paste it into SPREADSHEET_ID below.
 * 3. Add IT staff email addresses to the IT_STAFF array.
 * 4. Deploy as a Google Workspace Add-on (see README).
 */

// ============================================================
// BRANDING - Customize the look and feel for your school
// ============================================================

/**
 * Your school or organization name.
 * Appears in the sidebar header, email notifications, and spreadsheet title.
 */
const SCHOOL_NAME = 'Your School Name';

/**
 * URL to your school logo image.
 * Recommended: square image, at least 96x96 px, hosted on your school
 * domain or Google Drive (set sharing to "Anyone with the link").
 * 
 * To use a Google Drive image:
 *   1. Upload your logo to Google Drive.
 *   2. Right-click > Share > set to "Anyone with the link."
 *   3. Copy the file ID from the share URL.
 *   4. Use this format: https://drive.google.com/uc?export=view&id=YOUR_FILE_ID
 * 
 * Leave as empty string '' to use the default support agent icon.
 */
const SCHOOL_LOGO_URL = '';

/**
 * Primary accent color for buttons and highlights (hex format).
 * Used for the "Submit" button and primary action buttons.
 * Examples: '#1B5E20' (dark green), '#0D47A1' (dark blue), '#4A148C' (purple)
 */
const ACCENT_COLOR_PRIMARY = '#4285F4';

/**
 * Secondary accent color for IT management buttons (hex format).
 * Used for the IT queue button, save buttons, and management actions.
 */
const ACCENT_COLOR_SECONDARY = '#34A853';

/**
 * Spreadsheet header color (hex format).
 * Applied to the header row of the Tickets sheet.
 */
const SHEET_HEADER_COLOR = '#4285F4';

/**
 * Optional: school website URL included in email footers.
 * Leave as empty string '' to omit.
 */
const SCHOOL_WEBSITE_URL = '';

/**
 * Optional: IT department email for the "reply to" address on notifications
 * and included in email footers. Leave as empty string '' to omit.
 */
const IT_DEPARTMENT_EMAIL = '';


// ============================================================
// CONFIGURATION - Edit these values for your school
// ============================================================

/** 
 * The ID of the Google Sheet used as the ticket database.
 * Find this in the Sheet URL: docs.google.com/spreadsheets/d/{THIS_PART}/edit
 */
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';

/**
 * Email addresses of IT staff who can manage all tickets.
 * Staff not on this list will only see their own submitted tickets.
 */
const IT_STAFF = [
  // 'it-director@yourschool.org',
  // 'tech-support@yourschool.org',
];

/**
 * Ticket categories. Customize for your school's needs.
 */
const CATEGORIES = [
  'Computer / Laptop',
  'Printer / Copier',
  'Projector / Display',
  'Network / Wi-Fi',
  'Google Workspace (Email, Drive, Classroom)',
  'Software / Apps',
  'Phone System',
  'Account / Password Reset',
  'New Equipment Request',
  'Other',
];

/**
 * Priority levels.
 */
const PRIORITIES = [
  { label: 'Low - When you get a chance', value: 'Low' },
  { label: 'Medium - Affects my work', value: 'Medium' },
  { label: 'High - Cannot work', value: 'High' },
  { label: 'Urgent - Affects multiple people or classrooms', value: 'Urgent' },
];

/**
 * Ticket statuses and their display order.
 */
const STATUSES = [
  'Open',
  'In Progress',
  'Waiting on User',
  'Resolved',
  'Closed',
];

/**
 * Name of the sheet (tab) that stores tickets.
 */
const TICKETS_SHEET_NAME = 'Tickets';

/**
 * Name of the sheet (tab) that stores activity log.
 */
const LOG_SHEET_NAME = 'Activity Log';

/**
 * Email sender name for notifications.
 * Defaults to "[School Name] IT Help Desk" if SCHOOL_NAME is set.
 */
const NOTIFICATION_SENDER_NAME = SCHOOL_NAME !== 'Your School Name'
  ? SCHOOL_NAME + ' IT Help Desk'
  : 'IT Help Desk';


// ============================================================
// SETUP FUNCTION - Run once to create the spreadsheet
// ============================================================

/**
 * Creates and configures the backing Google Sheet.
 * Run this function once from the Apps Script editor.
 * Then copy the spreadsheet ID into SPREADSHEET_ID above.
 */
function setupSpreadsheet() {
  var sheetTitle = SCHOOL_NAME !== 'Your School Name'
    ? SCHOOL_NAME + ' - IT Help Desk Tickets'
    : 'IT Help Desk - Tickets';
  const ss = SpreadsheetApp.create(sheetTitle);
  
  // --- Tickets sheet ---
  const ticketSheet = ss.getActiveSheet();
  ticketSheet.setName(TICKETS_SHEET_NAME);
  
  const headers = [
    'Ticket ID',
    'Created',
    'Last Updated',
    'Submitter Email',
    'Submitter Name',
    'Category',
    'Priority',
    'Location / Room',
    'Subject',
    'Description',
    'Status',
    'Assigned To',
    'IT Notes',
  ];
  
  ticketSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  ticketSheet.getRange(1, 1, 1, headers.length)
    .setFontWeight('bold')
    .setBackground(SHEET_HEADER_COLOR)
    .setFontColor('#FFFFFF');
  ticketSheet.setFrozenRows(1);
  
  // Set column widths for readability
  ticketSheet.setColumnWidth(1, 100);   // Ticket ID
  ticketSheet.setColumnWidth(2, 150);   // Created
  ticketSheet.setColumnWidth(3, 150);   // Last Updated
  ticketSheet.setColumnWidth(4, 200);   // Submitter Email
  ticketSheet.setColumnWidth(5, 150);   // Submitter Name
  ticketSheet.setColumnWidth(6, 200);   // Category
  ticketSheet.setColumnWidth(7, 100);   // Priority
  ticketSheet.setColumnWidth(8, 150);   // Location
  ticketSheet.setColumnWidth(9, 250);   // Subject
  ticketSheet.setColumnWidth(10, 350);  // Description
  ticketSheet.setColumnWidth(11, 120);  // Status
  ticketSheet.setColumnWidth(12, 200);  // Assigned To
  ticketSheet.setColumnWidth(13, 350);  // IT Notes
  
  // --- Activity Log sheet ---
  const logSheet = ss.insertSheet(LOG_SHEET_NAME);
  const logHeaders = ['Timestamp', 'Ticket ID', 'Action', 'By', 'Details'];
  logSheet.getRange(1, 1, 1, logHeaders.length).setValues([logHeaders]);
  logSheet.getRange(1, 1, 1, logHeaders.length)
    .setFontWeight('bold')
    .setBackground('#34A853')
    .setFontColor('#FFFFFF');
  logSheet.setFrozenRows(1);
  
  // Apply data validation for Status column
  const statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(STATUSES)
    .setAllowInvalid(false)
    .build();
  ticketSheet.getRange('K2:K1000').setDataValidation(statusRule);
  
  // Apply conditional formatting for priority
  const urgentRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('Urgent')
    .setBackground('#EA4335')
    .setFontColor('#FFFFFF')
    .setRanges([ticketSheet.getRange('G2:G1000')])
    .build();
  const highRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('High')
    .setBackground('#FBBC04')
    .setRanges([ticketSheet.getRange('G2:G1000')])
    .build();
  ticketSheet.setConditionalFormatRules([urgentRule, highRule]);
  
  Logger.log('Spreadsheet created successfully!');
  Logger.log('Spreadsheet ID: ' + ss.getId());
  Logger.log('URL: ' + ss.getUrl());
  Logger.log('Copy the ID above into the SPREADSHEET_ID constant in Config.gs');
}
