/**
 * School IT Help Desk - Card UI Builders
 * All sidebar card views for staff and IT personnel.
 */

// ============================================================
// NEW TICKET FORM
// ============================================================

/**
 * Displays the new ticket submission form.
 */
function showNewTicketForm(e) {
  var card = CardService.newCardBuilder();
  
  card.setHeader(
    CardService.newCardHeader()
      .setTitle('New IT Request')
      .setSubtitle('Describe your issue or request')
  );
  
  var formSection = CardService.newCardSection();
  
  // Subject
  formSection.addWidget(
    CardService.newTextInput()
      .setFieldName('subject')
      .setTitle('Subject')
      .setHint('Brief summary of the issue')
  );
  
  // Category dropdown
  var categoryInput = CardService.newSelectionInput()
    .setType(CardService.SelectionInputType.DROPDOWN)
    .setFieldName('category')
    .setTitle('Category');
  
  CATEGORIES.forEach(function(cat) {
    categoryInput.addItem(cat, cat, false);
  });
  formSection.addWidget(categoryInput);
  
  // Priority dropdown
  var priorityInput = CardService.newSelectionInput()
    .setType(CardService.SelectionInputType.DROPDOWN)
    .setFieldName('priority')
    .setTitle('Priority');
  
  PRIORITIES.forEach(function(p) {
    priorityInput.addItem(p.label, p.value, false);
  });
  formSection.addWidget(priorityInput);
  
  // Location / Room
  formSection.addWidget(
    CardService.newTextInput()
      .setFieldName('location')
      .setTitle('Location / Room Number')
      .setHint('e.g., Room 204, Main Office, Library')
  );
  
  // Description
  formSection.addWidget(
    CardService.newTextInput()
      .setFieldName('description')
      .setTitle('Description')
      .setHint('Please include details: what happened, what you expected, any error messages')
      .setMultiline(true)
  );
  
  // Submit button
  formSection.addWidget(
    CardService.newTextButton()
      .setText('Submit Request')
      .setOnClickAction(
        CardService.newAction().setFunctionName('submitTicket')
      )
      .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
      .setBackgroundColor(ACCENT_COLOR_PRIMARY)
  );
  
  card.addSection(formSection);
  
  return CardService.newActionResponseBuilder()
    .setNavigation(CardService.newNavigation().pushCard(card.build()))
    .build();
}

/**
 * Handles ticket form submission.
 */
function submitTicket(e) {
  var inputs = e.formInput;
  
  // Validate required fields
  if (!inputs.subject || !inputs.category || !inputs.priority || !inputs.description) {
    return CardService.newActionResponseBuilder()
      .setNotification(
        CardService.newNotification()
          .setText('Please fill in all required fields: Subject, Category, Priority, and Description.')
      )
      .build();
  }
  
  var userEmail = Session.getActiveUser().getEmail();
  var userName = userEmail.split('@')[0].replace(/[._]/g, ' ');
  // Capitalize each word
  userName = userName.replace(/\b\w/g, function(l) { return l.toUpperCase(); });
  
  var ticket = {
    submitterEmail: userEmail,
    submitterName: userName,
    category: inputs.category,
    priority: inputs.priority,
    location: inputs.location || '',
    subject: inputs.subject,
    description: inputs.description,
    status: 'Open',
    assignedTo: '',
    notes: '',
  };
  
  var ticketId = createTicket(ticket);
  
  // Send confirmation email to submitter
  sendTicketConfirmation(ticket, ticketId);
  
  // Notify IT staff of new ticket
  notifyITStaffNewTicket(ticket, ticketId);
  
  // Show confirmation card
  var card = CardService.newCardBuilder();
  card.setHeader(
    CardService.newCardHeader()
      .setTitle('Request Submitted')
      .setSubtitle('Ticket ' + ticketId)
  );
  
  var section = CardService.newCardSection();
  
  section.addWidget(
    CardService.newDecoratedText()
      .setText('Your request has been submitted successfully. You will receive an email confirmation and updates as your ticket is processed.')
      .setWrapText(true)
  );
  
  section.addWidget(
    CardService.newDecoratedText()
      .setTopLabel('Ticket ID')
      .setText(ticketId)
  );
  
  section.addWidget(
    CardService.newDecoratedText()
      .setTopLabel('Subject')
      .setText(inputs.subject)
  );
  
  section.addWidget(
    CardService.newDecoratedText()
      .setTopLabel('Priority')
      .setText(inputs.priority)
  );
  
  section.addWidget(
    CardService.newTextButton()
      .setText('Back to Home')
      .setOnClickAction(
        CardService.newAction().setFunctionName('goHome')
      )
  );
  
  card.addSection(section);
  
  return CardService.newActionResponseBuilder()
    .setNavigation(
      CardService.newNavigation()
        .popToRoot()
        .updateCard(onHomepage())
        .pushCard(card.build())
    )
    .build();
}


// ============================================================
// MY TICKETS VIEW (for all staff)
// ============================================================

/**
 * Shows tickets submitted by the current user.
 */
function showMyTickets(e) {
  var userEmail = Session.getActiveUser().getEmail();
  var tickets = getTicketsBySubmitter(userEmail);
  
  var card = CardService.newCardBuilder();
  card.setHeader(
    CardService.newCardHeader()
      .setTitle('My Requests')
      .setSubtitle(tickets.length + ' ticket(s)')
  );
  
  if (tickets.length === 0) {
    var emptySection = CardService.newCardSection();
    emptySection.addWidget(
      CardService.newDecoratedText()
        .setText('You have no submitted requests.')
        .setWrapText(true)
    );
    card.addSection(emptySection);
  } else {
    // Group by status: open/active first, then resolved/closed
    var active = tickets.filter(function(t) {
      return ['Open', 'In Progress', 'Waiting on User'].indexOf(t.status) !== -1;
    });
    var resolved = tickets.filter(function(t) {
      return ['Resolved', 'Closed'].indexOf(t.status) !== -1;
    });
    
    if (active.length > 0) {
      var activeSection = CardService.newCardSection()
        .setHeader('Active (' + active.length + ')');
      active.forEach(function(t) {
        activeSection.addWidget(buildTicketListItem(t));
      });
      card.addSection(activeSection);
    }
    
    if (resolved.length > 0) {
      var resolvedSection = CardService.newCardSection()
        .setHeader('Resolved / Closed (' + resolved.length + ')')
        .setCollapsible(true)
        .setNumUncollapsibleWidgets(0);
      resolved.forEach(function(t) {
        resolvedSection.addWidget(buildTicketListItem(t));
      });
      card.addSection(resolvedSection);
    }
  }
  
  return CardService.newActionResponseBuilder()
    .setNavigation(CardService.newNavigation().pushCard(card.build()))
    .build();
}


// ============================================================
// IT QUEUE VIEW (IT staff only)
// ============================================================

/**
 * Shows the IT ticket queue with filter support.
 */
function showITQueue(e) {
  var userEmail = Session.getActiveUser().getEmail();
  if (!isITStaff(userEmail)) {
    return CardService.newActionResponseBuilder()
      .setNotification(
        CardService.newNotification().setText('Access denied. IT staff only.')
      )
      .build();
  }
  
  var filter = (e && e.parameters && e.parameters.filter) ? e.parameters.filter : 'open';
  var allTickets = getAllTickets();
  var tickets;
  var title;
  
  switch (filter) {
    case 'open':
      tickets = allTickets.filter(function(t) {
        return ['Open', 'In Progress', 'Waiting on User'].indexOf(t.status) !== -1;
      });
      title = 'Open Tickets';
      break;
    case 'mine':
      tickets = allTickets.filter(function(t) {
        return t.assignedTo.toLowerCase() === userEmail.toLowerCase() &&
               ['Open', 'In Progress', 'Waiting on User'].indexOf(t.status) !== -1;
      });
      title = 'Assigned to Me';
      break;
    case 'all':
      tickets = allTickets;
      title = 'All Tickets';
      break;
    default:
      tickets = allTickets;
      title = 'All Tickets';
  }
  
  // Sort: Urgent first, then High, then by date (newest first)
  var priorityOrder = { 'Urgent': 0, 'High': 1, 'Medium': 2, 'Low': 3 };
  tickets.sort(function(a, b) {
    var pa = priorityOrder[a.priority] !== undefined ? priorityOrder[a.priority] : 4;
    var pb = priorityOrder[b.priority] !== undefined ? priorityOrder[b.priority] : 4;
    if (pa !== pb) return pa - pb;
    return new Date(b.created) - new Date(a.created);
  });
  
  var card = CardService.newCardBuilder();
  card.setHeader(
    CardService.newCardHeader()
      .setTitle(title)
      .setSubtitle(tickets.length + ' ticket(s)')
  );
  
  if (tickets.length === 0) {
    var emptySection = CardService.newCardSection();
    emptySection.addWidget(
      CardService.newDecoratedText()
        .setText('No tickets found for this filter.')
        .setWrapText(true)
    );
    card.addSection(emptySection);
  } else {
    // Show up to 25 tickets to avoid card size limits
    var displayTickets = tickets.slice(0, 25);
    var section = CardService.newCardSection();
    
    displayTickets.forEach(function(t) {
      section.addWidget(buildTicketListItem(t, true));
    });
    
    if (tickets.length > 25) {
      section.addWidget(
        CardService.newDecoratedText()
          .setText('Showing 25 of ' + tickets.length + ' tickets. View the spreadsheet for the full list.')
          .setWrapText(true)
      );
    }
    
    card.addSection(section);
  }
  
  return CardService.newActionResponseBuilder()
    .setNavigation(CardService.newNavigation().pushCard(card.build()))
    .build();
}


// ============================================================
// TICKET DETAIL VIEW
// ============================================================

/**
 * Shows full detail for a single ticket.
 */
function showTicketDetail(e) {
  var ticketId = e.parameters.ticketId;
  var ticket = getTicketById(ticketId);
  
  if (!ticket) {
    return CardService.newActionResponseBuilder()
      .setNotification(
        CardService.newNotification().setText('Ticket not found.')
      )
      .build();
  }
  
  var userEmail = Session.getActiveUser().getEmail();
  var isIT = isITStaff(userEmail);
  var priorityIcon = getPriorityEmoji(ticket.priority);
  
  var card = CardService.newCardBuilder();
  card.setHeader(
    CardService.newCardHeader()
      .setTitle(ticket.ticketId)
      .setSubtitle(ticket.subject)
  );
  
  // --- Ticket Info ---
  var infoSection = CardService.newCardSection()
    .setHeader('Request Details');
  
  infoSection.addWidget(
    CardService.newDecoratedText()
      .setTopLabel('Status')
      .setText(ticket.status)
  );
  
  infoSection.addWidget(
    CardService.newDecoratedText()
      .setTopLabel('Priority')
      .setText(priorityIcon + ' ' + ticket.priority)
  );
  
  infoSection.addWidget(
    CardService.newDecoratedText()
      .setTopLabel('Category')
      .setText(ticket.category)
  );
  
  infoSection.addWidget(
    CardService.newDecoratedText()
      .setTopLabel('Location')
      .setText(ticket.location || 'Not specified')
  );
  
  infoSection.addWidget(
    CardService.newDecoratedText()
      .setTopLabel('Submitted by')
      .setText(ticket.submitterName + ' (' + ticket.submitterEmail + ')')
      .setWrapText(true)
  );
  
  infoSection.addWidget(
    CardService.newDecoratedText()
      .setTopLabel('Created')
      .setText(ticket.created)
  );
  
  if (ticket.assignedTo) {
    infoSection.addWidget(
      CardService.newDecoratedText()
        .setTopLabel('Assigned to')
        .setText(ticket.assignedTo)
    );
  }
  
  infoSection.addWidget(
    CardService.newDecoratedText()
      .setTopLabel('Description')
      .setText(ticket.description)
      .setWrapText(true)
  );
  
  if (ticket.notes) {
    infoSection.addWidget(
      CardService.newDecoratedText()
        .setTopLabel('IT Notes')
        .setText(ticket.notes)
        .setWrapText(true)
    );
  }
  
  card.addSection(infoSection);
  
  // --- IT Management Actions ---
  if (isIT) {
    var mgmtSection = CardService.newCardSection()
      .setHeader('Manage Ticket');
    
    // Status update
    var statusInput = CardService.newSelectionInput()
      .setType(CardService.SelectionInputType.DROPDOWN)
      .setFieldName('newStatus')
      .setTitle('Update Status');
    
    STATUSES.forEach(function(s) {
      statusInput.addItem(s, s, s === ticket.status);
    });
    mgmtSection.addWidget(statusInput);
    
    // Assign to
    var assignInput = CardService.newTextInput()
      .setFieldName('assignTo')
      .setTitle('Assign To (email)')
      .setHint('IT staff email address');
    
    if (ticket.assignedTo) {
      assignInput.setValue(ticket.assignedTo);
    }
    mgmtSection.addWidget(assignInput);
    
    // IT Notes
    mgmtSection.addWidget(
      CardService.newTextInput()
        .setFieldName('itNotes')
        .setTitle('Add / Update Notes')
        .setHint('Internal notes or response to the requester')
        .setMultiline(true)
        .setValue(ticket.notes || '')
    );
    
    // Update button
    mgmtSection.addWidget(
      CardService.newTextButton()
        .setText('Save Changes')
        .setOnClickAction(
          CardService.newAction()
            .setFunctionName('updateTicket')
            .setParameters({ ticketId: ticketId })
        )
        .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
        .setBackgroundColor(ACCENT_COLOR_SECONDARY)
    );
    
    card.addSection(mgmtSection);
  }
  
  return CardService.newActionResponseBuilder()
    .setNavigation(CardService.newNavigation().pushCard(card.build()))
    .build();
}

/**
 * Handles ticket update from IT staff.
 */
function updateTicket(e) {
  var ticketId = e.parameters.ticketId;
  var inputs = e.formInput;
  var userEmail = Session.getActiveUser().getEmail();
  
  if (!isITStaff(userEmail)) {
    return CardService.newActionResponseBuilder()
      .setNotification(
        CardService.newNotification().setText('Access denied.')
      )
      .build();
  }
  
  var oldTicket = getTicketById(ticketId);
  
  var updates = {
    status: inputs.newStatus || oldTicket.status,
    assignedTo: inputs.assignTo || oldTicket.assignedTo,
    notes: inputs.itNotes || oldTicket.notes,
  };
  
  saveTicketUpdates(ticketId, updates);
  
  // Log the activity
  logActivity(ticketId, 'Updated', userEmail,
    'Status: ' + updates.status + 
    (updates.assignedTo ? ', Assigned: ' + updates.assignedTo : '')
  );
  
  // Notify submitter if status changed
  if (updates.status !== oldTicket.status) {
    notifySubmitterStatusChange(oldTicket, updates.status, updates.notes);
  }
  
  return CardService.newActionResponseBuilder()
    .setNotification(
      CardService.newNotification().setText('Ticket ' + ticketId + ' updated.')
    )
    .setNavigation(
      CardService.newNavigation().popCard()
    )
    .build();
}


// ============================================================
// HELPER UI FUNCTIONS
// ============================================================

/**
 * Builds a compact list item widget for a ticket.
 */
function buildTicketListItem(ticket, showSubmitter) {
  var priorityIcon = getPriorityEmoji(ticket.priority);
  var statusLabel = '[' + ticket.status + ']';
  var topLine = priorityIcon + ' ' + ticket.ticketId + ' ' + statusLabel;
  var bottomLine = ticket.subject;
  
  if (showSubmitter) {
    bottomLine = ticket.submitterName + ' - ' + ticket.subject;
  }
  
  return CardService.newDecoratedText()
    .setText(topLine)
    .setBottomLabel(bottomLine)
    .setWrapText(true)
    .setOnClickAction(
      CardService.newAction()
        .setFunctionName('showTicketDetail')
        .setParameters({ ticketId: ticket.ticketId })
    );
}

/**
 * Returns a text-based priority indicator.
 */
function getPriorityEmoji(priority) {
  switch (priority) {
    case 'Urgent': return '🔴';
    case 'High':   return '🟡';
    case 'Medium': return '🔵';
    case 'Low':    return '⚪';
    default:       return '⚪';
  }
}

/**
 * Navigates back to the homepage.
 */
function goHome(e) {
  return CardService.newActionResponseBuilder()
    .setNavigation(
      CardService.newNavigation()
        .popToRoot()
        .updateCard(onHomepage())
    )
    .build();
}
