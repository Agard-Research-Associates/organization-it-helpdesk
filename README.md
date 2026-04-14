# School IT Help Desk

An open-source IT ticketing system built as a Google Workspace Add-on. Designed for schools and small organizations using Google Workspace. Staff submit and track IT requests from the Gmail sidebar; IT personnel manage, assign, and resolve tickets from the same interface. All data lives in a Google Sheet.

**License:** MIT

---

## Features

**For Staff (Teachers, Admins, etc.)**
- Submit IT requests with category, priority, room/location, and description
- Track your own tickets and view status updates
- Receive branded HTML email confirmations and status notifications

**For IT Staff**
- Dashboard with live ticket counts (open, in progress, urgent/high)
- View all open tickets sorted by priority, tickets assigned to you, or the full archive
- Assign tickets, update status, add internal notes
- Email notifications for every new ticket and assignment

**Technical**
- Google Sheets as the backend (zero external hosting, zero cost)
- Activity log for full audit trail
- Conditional formatting and data validation in the spreadsheet
- Works for a single IT person or a team of any size

---

## Branding and Customization

Every school can customize the add-on by editing the branding section at the top of `Config.gs`. No code changes are needed beyond filling in your values.

### Branding Constants (Config.gs)

| Constant | What It Controls | Example |
|---|---|---|
| `SCHOOL_NAME` | Sidebar header title, email sender name, spreadsheet title | `'Lincoln High School'` |
| `SCHOOL_LOGO_URL` | Logo in the Gmail sidebar header and HTML email banner | `'https://drive.google.com/uc?export=view&id=abc123'` |
| `ACCENT_COLOR_PRIMARY` | "Submit" button and email header bar color | `'#1B5E20'` (dark green) |
| `ACCENT_COLOR_SECONDARY` | IT management buttons (Queue, Save Changes) | `'#004D40'` (teal) |
| `SHEET_HEADER_COLOR` | Header row color in the Google Sheet | `'#1B5E20'` |
| `SCHOOL_WEBSITE_URL` | Link in email footer | `'https://www.lincolnhs.org'` |
| `IT_DEPARTMENT_EMAIL` | Reply-to address on notifications and email footer | `'ithelp@lincolnhs.org'` |

### Where Branding Appears

- **Gmail sidebar:** The card header shows your school logo (as a circular icon) and school name alongside "IT Help Desk." Button colors use your accent colors.
- **Email notifications:** HTML emails display your logo at the top of a colored banner, with your school name and IT contact info in the footer. A plain-text fallback is included for email clients that do not render HTML.
- **Google Sheet:** The header row uses your sheet header color.
- **Add-on manifest:** The add-on name and icon URL in `appsscript.json` should also be updated to match. These control what appears in the Gmail sidebar icon tray.

### Hosting Your Logo

For the `SCHOOL_LOGO_URL`, you have several options:

1. **Google Drive (simplest):** Upload the logo, right-click > Share > "Anyone with the link," then use `https://drive.google.com/uc?export=view&id=YOUR_FILE_ID`
2. **School website:** Use a direct URL to the image, e.g., `https://www.yourschool.org/images/logo.png`
3. **GitHub (if hosting the repo):** Use the raw file URL, e.g., `https://raw.githubusercontent.com/your-org/school-it-helpdesk/main/assets/logo.png`

Recommended: square image, at least 96x96 px, PNG or SVG.

---

## File Structure

```
school-it-helpdesk/
  appsscript.json          Manifest (scopes, triggers, add-on metadata)
  Config.gs                Branding, configuration, and one-time setup
  Code.gs                  Homepage trigger, navigation, entry point
  Cards.gs                 Card Service UI (forms, lists, detail views)
  TicketService.gs         CRUD operations against Google Sheets
  NotificationService.gs   Branded HTML email notifications
  LICENSE                  MIT License
  README.md                This file
```

---

## Setup Instructions

### Prerequisites

- A Google Workspace account (school domain or personal)
- Permission to install Workspace Add-ons on your domain (or admin access)
- Basic familiarity with copy/paste in Google Apps Script

### Step 1: Create the Apps Script Project

1. Go to [script.google.com](https://script.google.com) and click **New Project**.
2. Rename the project to your preferred name (e.g., "Lincoln HS IT Help Desk").
3. Delete the default `Code.gs` content.

### Step 2: Add the Source Files

For each `.gs` file in this project:

1. In the Apps Script editor, click the **+** next to **Files** and select **Script**.
2. Name the file to match (e.g., `Config`, `Code`, `Cards`, `TicketService`, `NotificationService`). Apps Script adds `.gs` automatically.
3. Paste the file contents.

For `appsscript.json`:

1. Go to **Project Settings** (gear icon).
2. Check **Show "appsscript.json" manifest file in editor**.
3. Return to the editor, open `appsscript.json`, and replace its contents.
4. Update the `name` field to your school's preferred add-on name.
5. Update `logoUrl` to your school logo (same URL as `SCHOOL_LOGO_URL`).

### Step 3: Create the Backing Spreadsheet

1. Open `Config.gs` in the editor.
2. Click the **Run** dropdown and select `setupSpreadsheet`.
3. Authorize the script when prompted.
4. Open **View > Execution log** to find the spreadsheet ID and URL.
5. Copy the ID and paste it into the `SPREADSHEET_ID` constant.
6. Save.

### Step 4: Configure for Your School

In `Config.gs`, update:

1. **Branding section:** `SCHOOL_NAME`, `SCHOOL_LOGO_URL`, accent colors, website URL, IT email.
2. **IT_STAFF:** Add your IT team's email addresses.
3. **CATEGORIES:** Adjust for your school's common request types.
4. **PRIORITIES:** Modify labels if needed.

### Step 5: Deploy

**For testing (single user):**

1. Click **Deploy > Test deployments**.
2. Select **Gmail Add-on** as the application type.
3. Click **Install**.
4. Open Gmail. The add-on appears in the right sidebar.

**For your school domain:**

1. Click **Deploy > New deployment**.
2. Select type **Add-on** and fill in the description.
3. Click **Deploy**.
4. To restrict to your domain (not the public Marketplace):
   - In [Google Cloud Console](https://console.cloud.google.com), enable the **Google Workspace Marketplace SDK** for your project.
   - Configure the listing as **Private** (visible only to your domain).
   - Your Workspace admin installs it domain-wide from Admin Console > Apps > Google Workspace Marketplace apps.

---

## Publishing to GitHub

If you want to host this as an open-source repository (for your school, district, or the broader community), follow these steps.

### Initial Repository Setup

**Option A: Using the GitHub web interface**

1. Sign in to [github.com](https://github.com) (or create an account).
2. Click the **+** in the top-right corner and select **New repository**.
3. Fill in the details:
   - **Repository name:** `school-it-helpdesk` (or your preferred name)
   - **Description:** "Open-source IT ticketing system for schools, built as a Google Workspace Gmail Add-on"
   - **Visibility:** Public (for open source) or Private
   - **Initialize with:** Check "Add a README file" (you will replace it)
   - **License:** Select MIT License
4. Click **Create repository**.
5. On the repository page, click **Add file > Upload files**.
6. Drag and drop all project files (`appsscript.json`, all `.gs` files, `LICENSE`, `README.md`).
7. Write a commit message (e.g., "Initial release: v1.0.0") and click **Commit changes**.

**Option B: Using Git from the command line**

If you have Git installed locally:

```bash
# 1. Create a new directory and initialize it
mkdir school-it-helpdesk
cd school-it-helpdesk
git init

# 2. Copy all project files into this directory
#    (appsscript.json, *.gs, LICENSE, README.md)

# 3. Stage all files
git add .

# 4. Create the initial commit
git commit -m "Initial release: v1.0.0"

# 5. Create the repository on GitHub first (via github.com),
#    then connect and push:
git remote add origin https://github.com/YOUR-USERNAME/school-it-helpdesk.git
git branch -M main
git push -u origin main
```

### Recommended Repository Structure

For a polished open-source project, consider adding:

```
school-it-helpdesk/
  assets/
    logo-placeholder.png     Example logo for documentation
    email-preview.png         Screenshot of a branded email
  screenshots/
    sidebar-staff.png         Screenshot of the staff view
    sidebar-it-dashboard.png  Screenshot of the IT dashboard
    spreadsheet.png           Screenshot of the ticket sheet
  .gitignore
  appsscript.json
  Config.gs
  Code.gs
  Cards.gs
  TicketService.gs
  NotificationService.gs
  LICENSE
  README.md
  CONTRIBUTING.md
```

### Creating a .gitignore

Create a `.gitignore` file to keep the repository clean:

```
# OS files
.DS_Store
Thumbs.db

# Editor files
*.swp
*.swo
*~
.vscode/
.idea/

# Node (if you add clasp tooling later)
node_modules/
package-lock.json
```

### Tagging Releases

When you reach a stable version, tag it so others can reference specific releases:

```bash
git tag -a v1.0.0 -m "Initial public release"
git push origin v1.0.0
```

On GitHub, go to **Releases > Create a new release**, select your tag, and write release notes describing what the version includes.

### Optional: Using Google clasp for Syncing

[clasp](https://github.com/google/clasp) is Google's command-line tool for managing Apps Script projects. It lets you push code from your local Git repository directly to Apps Script, so you can maintain a single source of truth in GitHub.

```bash
# Install clasp
npm install -g @google/clasp

# Login to your Google account
clasp login

# Clone your existing Apps Script project
clasp clone YOUR_SCRIPT_ID

# After making changes locally, push to Apps Script
clasp push

# Pull changes made in the Apps Script editor
clasp pull
```

This is optional but useful if you expect to iterate on the code frequently or accept contributions from others.

---

## How It Works

### For Staff

1. Open Gmail and click the IT Help Desk icon in the right sidebar.
2. Click **New** to submit a request.
3. Fill in subject, category, priority, room/location, and description.
4. Click **Submit Request**.
5. Receive a branded email confirmation with your ticket number.
6. Click **View** under "My Submitted Requests" to check status.
7. Receive email notifications when IT updates your ticket.

### For IT Staff

1. Open Gmail and click the IT Help Desk icon.
2. The sidebar shows the IT Management section with filters and a dashboard.
3. Click **Queue** for all open tickets (sorted by priority).
4. Click any ticket for full details.
5. Update status, assign to a team member, add notes.
6. Click **Save Changes** to update and notify the submitter.

### In the Spreadsheet

The Google Sheet provides a filterable, sortable view of all tickets with conditional formatting (red for Urgent, yellow for High), an Activity Log tab for audit trail, and a data source for custom reports or pivot tables.

---

## Customization Guide

### Adding New Categories

Edit the `CATEGORIES` array in `Config.gs`. No code changes needed elsewhere.

### Adding Custom Fields

1. Add a column header to the spreadsheet (or update `setupSpreadsheet`).
2. Add a form input widget in `showNewTicketForm()` in `Cards.gs`.
3. Include the field in the row array in `createTicket()` in `TicketService.gs`.
4. Add it to the `rowToTicket()` mapping.

### Changing the Ticket ID Format

Edit `generateTicketId()` in `TicketService.gs`. For example, to use a school abbreviation: `'LHS-0001'`.

---

## Troubleshooting

| Issue | Solution |
|---|---|
| "Spreadsheet not found" | Verify `SPREADSHEET_ID` in `Config.gs`. Ensure the script account has edit access. |
| Add-on not in Gmail | Check test deployment is installed. Refresh Gmail or clear cache. |
| Emails not sending | Check execution log. Verify `script.send_mail` scope. MailApp quota: 100/day free, higher for Workspace. |
| Logo not showing in emails | Verify the image URL is publicly accessible. Google Drive images need "Anyone with the link" sharing. |
| "Access denied" on IT views | User email is not in the `IT_STAFF` array. Matching is case-insensitive. |

---

## Contributing

Contributions, bug reports, and feature requests are welcome.

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Test using **Deploy > Test deployments** in Apps Script.
4. Commit and push your changes.
5. Open a pull request with a description of what was changed and why.

---

## Roadmap

- File attachments via Google Drive
- Recurring maintenance tickets
- SLA tracking with automated escalation
- Canned response templates
- Google Chat notifications
- Reporting dashboard web app
- Multi-language support
