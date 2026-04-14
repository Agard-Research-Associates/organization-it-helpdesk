/**
 * School IT Help Desk - Main Entry Point
 * Handles the homepage trigger and top-level navigation.
 */

/**
 * Homepage trigger. Displays the appropriate landing card
 * based on whether the user is IT staff or general staff.
 */
function onHomepage(e) {
  var userEmail = Session.getActiveUser().getEmail();
  var isIT = isITStaff(userEmail);
  
  var builder = CardService.newCardBuilder();
  
  // --- Header (uses school branding from Config.gs) ---
  var logoUrl = SCHOOL_LOGO_URL || 'https://fonts.gstatic.com/s/i/short-term/release/googlesymbols/support_agent/default/48px.svg';
  var headerTitle = SCHOOL_NAME !== 'Your School Name'
    ? SCHOOL_NAME + ' IT Help Desk'
    : 'IT Help Desk';
  
  builder.setHeader(
    CardService.newCardHeader()
      .setTitle(headerTitle)
      .setSubtitle(isIT ? 'IT Staff View' : 'Submit & Track Requests')
      .setImageUrl(logoUrl)
      .setImageStyle(CardService.ImageStyle.CIRCLE)
  );
  
  // --- Quick Actions Section ---
  var actionsSection = CardService.newCardSection()
    .setHeader('Quick Actions');
  
  // Submit new ticket button (everyone)
  actionsSection.addWidget(
    CardService.newDecoratedText()
      .setText('Submit New Request')
      .setStartIcon(
        CardService.newIconImage().setIconUrl(
          'https://fonts.gstatic.com/s/i/short-term/release/googlesymbols/add_circle/default/24px.svg'
        )
      )
      .setButton(
        CardService.newTextButton()
          .setText('New')
          .setOnClickAction(
            CardService.newAction().setFunctionName('showNewTicketForm')
          )
          .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
          .setBackgroundColor(ACCENT_COLOR_PRIMARY)
      )
  );
  
  // My tickets button (everyone)
  actionsSection.addWidget(
    CardService.newDecoratedText()
      .setText('My Submitted Requests')
      .setStartIcon(
        CardService.newIconImage().setIconUrl(
          'https://fonts.gstatic.com/s/i/short-term/release/googlesymbols/list_alt/default/24px.svg'
        )
      )
      .setButton(
        CardService.newTextButton()
          .setText('View')
          .setOnClickAction(
            CardService.newAction().setFunctionName('showMyTickets')
          )
      )
  );
  
  builder.addSection(actionsSection);
  
  // --- IT Staff Section (only visible to IT staff) ---
  if (isIT) {
    var itSection = CardService.newCardSection()
      .setHeader('IT Management');
    
    itSection.addWidget(
      CardService.newDecoratedText()
        .setText('All Open Tickets')
        .setStartIcon(
          CardService.newIconImage().setIconUrl(
            'https://fonts.gstatic.com/s/i/short-term/release/googlesymbols/inbox/default/24px.svg'
          )
        )
        .setButton(
          CardService.newTextButton()
            .setText('Queue')
            .setOnClickAction(
              CardService.newAction()
                .setFunctionName('showITQueue')
                .setParameters({ filter: 'open' })
            )
            .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
            .setBackgroundColor(ACCENT_COLOR_SECONDARY)
        )
    );
    
    itSection.addWidget(
      CardService.newDecoratedText()
        .setText('Assigned to Me')
        .setStartIcon(
          CardService.newIconImage().setIconUrl(
            'https://fonts.gstatic.com/s/i/short-term/release/googlesymbols/person/default/24px.svg'
          )
        )
        .setButton(
          CardService.newTextButton()
            .setText('View')
            .setOnClickAction(
              CardService.newAction()
                .setFunctionName('showITQueue')
                .setParameters({ filter: 'mine' })
            )
        )
    );
    
    itSection.addWidget(
      CardService.newDecoratedText()
        .setText('All Tickets (incl. closed)')
        .setStartIcon(
          CardService.newIconImage().setIconUrl(
            'https://fonts.gstatic.com/s/i/short-term/release/googlesymbols/folder_open/default/24px.svg'
          )
        )
        .setButton(
          CardService.newTextButton()
            .setText('View')
            .setOnClickAction(
              CardService.newAction()
                .setFunctionName('showITQueue')
                .setParameters({ filter: 'all' })
            )
        )
    );
    
    builder.addSection(itSection);
    
    // --- Stats Section ---
    var stats = getTicketStats();
    var statsSection = CardService.newCardSection()
      .setHeader('Dashboard');
    
    statsSection.addWidget(
      CardService.newDecoratedText()
        .setTopLabel('Open')
        .setText(String(stats.open))
        .setStartIcon(
          CardService.newIconImage().setIconUrl(
            'https://fonts.gstatic.com/s/i/short-term/release/googlesymbols/radio_button_unchecked/default/24px.svg'
          )
        )
    );
    
    statsSection.addWidget(
      CardService.newDecoratedText()
        .setTopLabel('In Progress')
        .setText(String(stats.inProgress))
        .setStartIcon(
          CardService.newIconImage().setIconUrl(
            'https://fonts.gstatic.com/s/i/short-term/release/googlesymbols/pending/default/24px.svg'
          )
        )
    );
    
    statsSection.addWidget(
      CardService.newDecoratedText()
        .setTopLabel('Urgent / High Priority')
        .setText(String(stats.urgentHigh))
        .setStartIcon(
          CardService.newIconImage().setIconUrl(
            'https://fonts.gstatic.com/s/i/short-term/release/googlesymbols/warning/default/24px.svg'
          )
        )
    );
    
    builder.addSection(statsSection);
  }
  
  return builder.build();
}

/**
 * Checks if the given email belongs to an IT staff member.
 */
function isITStaff(email) {
  return IT_STAFF.indexOf(email.toLowerCase()) !== -1;
}
