/**
 * School IT Help Desk - Notification Service
 * Sends branded HTML email notifications for ticket events.
 */

// ============================================================
// HTML EMAIL TEMPLATE
// ============================================================

/**
 * Generates a branded HTML email body.
 * All branding values come from Config.gs constants.
 * 
 * @param {string} heading   - The main heading text.
 * @param {string} bodyHtml  - Inner HTML content (paragraphs, tables, etc.).
 * @returns {string}         - Complete HTML email string.
 */
function buildEmailHtml(heading, bodyHtml) {
  var accentColor = ACCENT_COLOR_PRIMARY || '#4285F4';
  var schoolName = SCHOOL_NAME !== 'Your School Name' ? SCHOOL_NAME : '';
  var logoUrl = SCHOOL_LOGO_URL || '';
  var websiteUrl = SCHOOL_WEBSITE_URL || '';
  var itEmail = IT_DEPARTMENT_EMAIL || '';
  
  // Build the logo block (only if a logo URL is configured)
  var logoBlock = '';
  if (logoUrl) {
    logoBlock = '<img src="' + logoUrl + '" alt="' + schoolName + '" '
      + 'style="max-height:60px;max-width:200px;margin-bottom:12px;" /><br />';
  }
  
  // Build the footer
  var footerLines = [];
  if (schoolName) footerLines.push(schoolName);
  footerLines.push(NOTIFICATION_SENDER_NAME);
  if (itEmail) footerLines.push('<a href="mailto:' + itEmail + '" style="color:' + accentColor + ';">' + itEmail + '</a>');
  if (websiteUrl) footerLines.push('<a href="' + websiteUrl + '" style="color:' + accentColor + ';">' + websiteUrl + '</a>');
  
  var html = ''
    + '<!DOCTYPE html>'
    + '<html><head><meta charset="utf-8" /></head>'
    + '<body style="margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;background-color:#f5f5f5;">'
    + '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5;padding:24px 0;">'
    + '<tr><td align="center">'
    + '<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;">'
    
    // Header bar with accent color
    + '<tr><td style="background-color:' + accentColor + ';padding:24px 32px;text-align:center;">'
    + logoBlock
    + '<h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:600;">' + heading + '</h1>'
    + '</td></tr>'
    
    // Body content
    + '<tr><td style="padding:24px 32px;color:#333333;font-size:14px;line-height:1.6;">'
    + bodyHtml
    + '</td></tr>'
    
    // Footer
    + '<tr><td style="padding:16px 32px;border-top:1px solid #e0e0e0;text-align:center;color:#888888;font-size:12px;">'
    + footerLines.join(' &middot; ')
    + '</td></tr>'
    
    + '</table>'
    + '</td></tr></table>'
    + '</body></html>';
  
  return html;
}

/**
 * Helper: builds a detail row for ticket info tables in emails.
 */
function emailDetailRow(label, value) {
  return '<tr>'
    + '<td style="padding:4px 8px;font-weight:600;color:#555555;white-space:nowrap;vertical-align:top;">' + label + '</td>'
    + '<td style="padding:4px 8px;color:#333333;">' + (value || 'N/A') + '</td>'
    + '</tr>';
}

/**
 * Helper: wraps ticket detail rows in a styled table.
 */
function emailDetailTable(rows) {
  return '<table role="presentation" cellpadding="0" cellspacing="0" '
    + 'style="width:100%;background-color:#f9f9f9;border-radius:6px;margin:12px 0;border:1px solid #e0e0e0;">'
    + rows
    + '</table>';
}


// ============================================================
// NOTIFICATION FUNCTIONS
// ============================================================

/**
 * Sends a confirmation email to the person who submitted a ticket.
 */
function sendTicketConfirmation(ticket, ticketId) {
  try {
    var subject = '[IT Help Desk] Request Received - ' + ticketId;
    
    var detailRows = ''
      + emailDetailRow('Ticket ID', ticketId)
      + emailDetailRow('Subject', ticket.subject)
      + emailDetailRow('Category', ticket.category)
      + emailDetailRow('Priority', ticket.priority)
      + emailDetailRow('Location', ticket.location || 'Not specified');
    
    var bodyHtml = ''
      + '<p>Hello ' + ticket.submitterName + ',</p>'
      + '<p>Your IT request has been received and assigned ticket number <strong>' + ticketId + '</strong>.</p>'
      + emailDetailTable(detailRows)
      + '<p>You will receive email updates as your request is reviewed and resolved.</p>'
      + '<p>Thank you for submitting your request.</p>';
    
    var htmlBody = buildEmailHtml('Request Received', bodyHtml);
    
    // Plain text fallback
    var plainBody = 'Hello ' + ticket.submitterName + ',\n\n'
      + 'Your IT request has been received and assigned ticket number ' + ticketId + '.\n\n'
      + 'Subject:    ' + ticket.subject + '\n'
      + 'Category:   ' + ticket.category + '\n'
      + 'Priority:   ' + ticket.priority + '\n'
      + 'Location:   ' + (ticket.location || 'Not specified') + '\n\n'
      + 'You will receive email updates when your request is updated.\n\n'
      + NOTIFICATION_SENDER_NAME;
    
    var emailOptions = {
      to: ticket.submitterEmail,
      subject: subject,
      body: plainBody,
      htmlBody: htmlBody,
      name: NOTIFICATION_SENDER_NAME,
    };
    
    if (IT_DEPARTMENT_EMAIL) {
      emailOptions.replyTo = IT_DEPARTMENT_EMAIL;
    }
    
    MailApp.sendEmail(emailOptions);
  } catch (err) {
    Logger.log('Error sending confirmation email: ' + err.message);
  }
}

/**
 * Notifies all IT staff about a new ticket.
 */
function notifyITStaffNewTicket(ticket, ticketId) {
  if (IT_STAFF.length === 0) return;
  
  try {
    var subject = '[IT Help Desk] New ' + ticket.priority + ' Request - ' + ticketId;
    
    var detailRows = ''
      + emailDetailRow('Ticket ID', ticketId)
      + emailDetailRow('From', ticket.submitterName + ' (' + ticket.submitterEmail + ')')
      + emailDetailRow('Category', ticket.category)
      + emailDetailRow('Priority', ticket.priority)
      + emailDetailRow('Location', ticket.location || 'Not specified')
      + emailDetailRow('Subject', ticket.subject);
    
    var bodyHtml = ''
      + '<p>A new IT request has been submitted.</p>'
      + emailDetailTable(detailRows)
      + '<p><strong>Description:</strong></p>'
      + '<p style="background-color:#f9f9f9;padding:12px;border-radius:6px;border:1px solid #e0e0e0;">'
      + ticket.description.replace(/\n/g, '<br />') + '</p>'
      + '<p>Open the <strong>IT Help Desk</strong> add-on in Gmail to manage this ticket.</p>';
    
    var htmlBody = buildEmailHtml('New ' + ticket.priority + ' Request', bodyHtml);
    
    // Plain text fallback
    var plainBody = 'A new IT request has been submitted.\n\n'
      + 'Ticket ID:    ' + ticketId + '\n'
      + 'From:         ' + ticket.submitterName + ' (' + ticket.submitterEmail + ')\n'
      + 'Category:     ' + ticket.category + '\n'
      + 'Priority:     ' + ticket.priority + '\n'
      + 'Location:     ' + (ticket.location || 'Not specified') + '\n'
      + 'Subject:      ' + ticket.subject + '\n\n'
      + 'Description:\n' + ticket.description + '\n\n'
      + 'Open the IT Help Desk add-on in Gmail to manage this ticket.\n\n'
      + NOTIFICATION_SENDER_NAME;
    
    MailApp.sendEmail({
      to: IT_STAFF.join(','),
      subject: subject,
      body: plainBody,
      htmlBody: htmlBody,
      name: NOTIFICATION_SENDER_NAME,
    });
  } catch (err) {
    Logger.log('Error notifying IT staff: ' + err.message);
  }
}

/**
 * Notifies the ticket submitter when the status changes.
 */
function notifySubmitterStatusChange(ticket, newStatus, notes) {
  try {
    var subject = '[IT Help Desk] ' + ticket.ticketId + ' - Status Update: ' + newStatus;
    
    var detailRows = ''
      + emailDetailRow('Ticket ID', ticket.ticketId)
      + emailDetailRow('Subject', ticket.subject)
      + emailDetailRow('New Status', '<strong>' + newStatus + '</strong>');
    
    var bodyHtml = ''
      + '<p>Hello ' + ticket.submitterName + ',</p>'
      + '<p>Your IT request has been updated.</p>'
      + emailDetailTable(detailRows);
    
    if (notes) {
      bodyHtml += '<p><strong>Message from IT:</strong></p>'
        + '<p style="background-color:#f9f9f9;padding:12px;border-radius:6px;border:1px solid #e0e0e0;">'
        + notes.replace(/\n/g, '<br />') + '</p>';
    }
    
    if (newStatus === 'Resolved') {
      bodyHtml += '<p>If this resolves your issue, no action is needed. '
        + 'If you still need assistance, please submit a new request referencing '
        + '<strong>' + ticket.ticketId + '</strong>.</p>';
    }
    
    var htmlBody = buildEmailHtml('Ticket Update: ' + newStatus, bodyHtml);
    
    // Plain text fallback
    var plainBody = 'Hello ' + ticket.submitterName + ',\n\n'
      + 'Your IT request ' + ticket.ticketId + ' has been updated.\n\n'
      + 'Subject:      ' + ticket.subject + '\n'
      + 'New Status:   ' + newStatus + '\n';
    
    if (notes) {
      plainBody += '\nMessage from IT:\n' + notes + '\n';
    }
    
    if (newStatus === 'Resolved') {
      plainBody += '\nIf this resolves your issue, no action is needed. '
        + 'If you still need assistance, please submit a new request referencing '
        + ticket.ticketId + '.\n';
    }
    
    plainBody += '\n' + NOTIFICATION_SENDER_NAME;
    
    var emailOptions = {
      to: ticket.submitterEmail,
      subject: subject,
      body: plainBody,
      htmlBody: htmlBody,
      name: NOTIFICATION_SENDER_NAME,
    };
    
    if (IT_DEPARTMENT_EMAIL) {
      emailOptions.replyTo = IT_DEPARTMENT_EMAIL;
    }
    
    MailApp.sendEmail(emailOptions);
  } catch (err) {
    Logger.log('Error sending status update email: ' + err.message);
  }
}

/**
 * Notifies an IT staff member when a ticket is assigned to them.
 */
function notifyAssignment(ticket, assigneeEmail) {
  try {
    var subject = '[IT Help Desk] Ticket Assigned to You - ' + ticket.ticketId;
    
    var detailRows = ''
      + emailDetailRow('Ticket ID', ticket.ticketId)
      + emailDetailRow('From', ticket.submitterName + ' (' + ticket.submitterEmail + ')')
      + emailDetailRow('Category', ticket.category)
      + emailDetailRow('Priority', ticket.priority)
      + emailDetailRow('Location', ticket.location || 'Not specified')
      + emailDetailRow('Subject', ticket.subject);
    
    var bodyHtml = ''
      + '<p>A ticket has been assigned to you.</p>'
      + emailDetailTable(detailRows)
      + '<p><strong>Description:</strong></p>'
      + '<p style="background-color:#f9f9f9;padding:12px;border-radius:6px;border:1px solid #e0e0e0;">'
      + ticket.description.replace(/\n/g, '<br />') + '</p>'
      + '<p>Open the <strong>IT Help Desk</strong> add-on in Gmail to manage this ticket.</p>';
    
    var htmlBody = buildEmailHtml('Ticket Assigned to You', bodyHtml);
    
    // Plain text fallback
    var plainBody = 'A ticket has been assigned to you.\n\n'
      + 'Ticket ID:    ' + ticket.ticketId + '\n'
      + 'From:         ' + ticket.submitterName + ' (' + ticket.submitterEmail + ')\n'
      + 'Category:     ' + ticket.category + '\n'
      + 'Priority:     ' + ticket.priority + '\n'
      + 'Location:     ' + (ticket.location || 'Not specified') + '\n'
      + 'Subject:      ' + ticket.subject + '\n\n'
      + 'Description:\n' + ticket.description + '\n\n'
      + 'Open the IT Help Desk add-on in Gmail to manage this ticket.\n\n'
      + NOTIFICATION_SENDER_NAME;
    
    MailApp.sendEmail({
      to: assigneeEmail,
      subject: subject,
      body: plainBody,
      htmlBody: htmlBody,
      name: NOTIFICATION_SENDER_NAME,
    });
  } catch (err) {
    Logger.log('Error sending assignment notification: ' + err.message);
  }
}
