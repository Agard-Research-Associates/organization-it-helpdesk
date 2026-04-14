/**
 * School IT Help Desk - Ticket Service
 * CRUD operations for tickets stored in Google Sheets.
 */

/**
 * Creates a new ticket and returns the generated ticket ID.
 */
function createTicket(ticket) {
  var sheet = getTicketsSheet();
  var ticketId = generateTicketId(sheet);
  var now = new Date();
  var timestamp = Utilities.formatDate(now, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm');
  
  var row = [
    ticketId,
    timestamp,
    timestamp,
    ticket.submitterEmail,
    ticket.submitterName,
    ticket.category,
    ticket.priority,
    ticket.location,
    ticket.subject,
    ticket.description,
    ticket.status,
    ticket.assignedTo,
    ticket.notes,
  ];
  
  sheet.appendRow(row);
  
  // Log creation
  logActivity(ticketId, 'Created', ticket.submitterEmail, 
    ticket.category + ' - ' + ticket.priority);
  
  return ticketId;
}

/**
 * Retrieves a ticket by its ID.
 * Returns null if not found.
 */
function getTicketById(ticketId) {
  var sheet = getTicketsSheet();
  var data = sheet.getDataRange().getValues();
  
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === ticketId) {
      return rowToTicket(data[i], i + 1);
    }
  }
  return null;
}

/**
 * Retrieves all tickets submitted by a specific email address.
 */
function getTicketsBySubmitter(email) {
  var sheet = getTicketsSheet();
  var data = sheet.getDataRange().getValues();
  var tickets = [];
  
  for (var i = 1; i < data.length; i++) {
    if (data[i][3].toString().toLowerCase() === email.toLowerCase()) {
      tickets.push(rowToTicket(data[i], i + 1));
    }
  }
  
  // Sort by date, newest first
  tickets.sort(function(a, b) {
    return new Date(b.created) - new Date(a.created);
  });
  
  return tickets;
}

/**
 * Retrieves all tickets.
 */
function getAllTickets() {
  var sheet = getTicketsSheet();
  var data = sheet.getDataRange().getValues();
  var tickets = [];
  
  for (var i = 1; i < data.length; i++) {
    if (data[i][0]) { // Skip empty rows
      tickets.push(rowToTicket(data[i], i + 1));
    }
  }
  
  return tickets;
}

/**
 * Updates a ticket's status, assignment, and notes.
 */
function saveTicketUpdates(ticketId, updates) {
  var sheet = getTicketsSheet();
  var data = sheet.getDataRange().getValues();
  
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === ticketId) {
      var rowNum = i + 1;
      var now = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm');
      
      // Update: Last Updated (col 3), Status (col 11), Assigned To (col 12), Notes (col 13)
      sheet.getRange(rowNum, 3).setValue(now);
      sheet.getRange(rowNum, 11).setValue(updates.status);
      sheet.getRange(rowNum, 12).setValue(updates.assignedTo);
      sheet.getRange(rowNum, 13).setValue(updates.notes);
      
      return true;
    }
  }
  return false;
}

/**
 * Returns basic ticket statistics for the IT dashboard.
 */
function getTicketStats() {
  var tickets = getAllTickets();
  var stats = {
    open: 0,
    inProgress: 0,
    urgentHigh: 0,
    resolvedThisWeek: 0,
  };
  
  var oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  tickets.forEach(function(t) {
    if (t.status === 'Open') stats.open++;
    if (t.status === 'In Progress') stats.inProgress++;
    if ((t.priority === 'Urgent' || t.priority === 'High') &&
        ['Open', 'In Progress', 'Waiting on User'].indexOf(t.status) !== -1) {
      stats.urgentHigh++;
    }
    if (t.status === 'Resolved' && new Date(t.lastUpdated) >= oneWeekAgo) {
      stats.resolvedThisWeek++;
    }
  });
  
  return stats;
}


// ============================================================
// INTERNAL HELPERS
// ============================================================

/**
 * Gets or opens the Tickets sheet.
 */
function getTicketsSheet() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  return ss.getSheetByName(TICKETS_SHEET_NAME);
}

/**
 * Gets or opens the Activity Log sheet.
 */
function getLogSheet() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  return ss.getSheetByName(LOG_SHEET_NAME);
}

/**
 * Generates the next ticket ID in sequence.
 * Format: TKT-0001, TKT-0002, etc.
 */
function generateTicketId(sheet) {
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    return 'TKT-0001';
  }
  
  var lastId = sheet.getRange(lastRow, 1).getValue().toString();
  var num = parseInt(lastId.replace('TKT-', ''), 10);
  if (isNaN(num)) num = 0;
  var nextNum = num + 1;
  return 'TKT-' + ('0000' + nextNum).slice(-4);
}

/**
 * Converts a sheet row array into a ticket object.
 */
function rowToTicket(row, rowNumber) {
  return {
    ticketId: row[0],
    created: row[1],
    lastUpdated: row[2],
    submitterEmail: row[3],
    submitterName: row[4],
    category: row[5],
    priority: row[6],
    location: row[7],
    subject: row[8],
    description: row[9],
    status: row[10],
    assignedTo: row[11],
    notes: row[12],
    rowNumber: rowNumber,
  };
}

/**
 * Logs an activity to the Activity Log sheet.
 */
function logActivity(ticketId, action, byEmail, details) {
  var logSheet = getLogSheet();
  var now = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
  logSheet.appendRow([now, ticketId, action, byEmail, details]);
}
