# Contributing to School IT Help Desk

Thank you for your interest in contributing to this project. This guide explains how to get involved, whether you are reporting a bug, suggesting a feature, or submitting code.

---

## Code of Conduct

This project is intended to serve schools and educational organizations. All contributors are expected to engage respectfully and constructively. Harassment, discrimination, and unconstructive criticism will not be tolerated.

---

## How to Contribute

### Reporting Bugs

1. Check the [Issues](../../issues) tab to see if the bug has already been reported.
2. If not, open a new issue with the following information:
   - A clear, descriptive title.
   - Steps to reproduce the problem.
   - What you expected to happen vs. what actually happened.
   - Your environment: Google Workspace edition (free, Education, Business, etc.), browser, and whether the add-on is deployed as a test or domain-wide.
   - Screenshots of the sidebar or error messages, if applicable.

### Suggesting Features

Open an issue with the "enhancement" label. Describe:

- The problem the feature would solve.
- Who benefits (staff submitting tickets, IT staff managing them, Workspace admins deploying the add-on).
- Any ideas for how it could work within the Card Service API constraints.

### Submitting Code Changes

1. **Fork** the repository.
2. **Create a feature branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes.** Follow the coding conventions described below.
4. **Test thoroughly** using Apps Script's **Deploy > Test deployments** in your own Workspace account.
5. **Commit** with a clear message describing what changed and why:
   ```bash
   git commit -m "Add SLA countdown display to ticket detail view"
   ```
6. **Push** to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
7. **Open a pull request** against `main` in the upstream repository. Include:
   - A summary of the change.
   - How you tested it.
   - Screenshots of any UI changes (sidebar cards, emails, spreadsheet formatting).

---

## Development Setup

### Prerequisites

- A Google account with access to [Google Apps Script](https://script.google.com).
- (Optional) [clasp](https://github.com/google/clasp) installed for local development and syncing.

### Getting Started

1. Fork and clone the repository.
2. Create a new Apps Script project at [script.google.com](https://script.google.com).
3. Copy each `.gs` file into the project (or use `clasp push` if you have clasp configured).
4. Replace `appsscript.json` with the project manifest.
5. Run `setupSpreadsheet()` once to create the backing Google Sheet.
6. Paste the spreadsheet ID into `Config.gs`.
7. Deploy as a test add-on and verify it works in Gmail.

### Using clasp (Optional)

If you prefer local development:

```bash
npm install -g @google/clasp
clasp login
clasp create --type standalone --title "IT Help Desk Dev"
# Copy .gs and appsscript.json into the clasp project directory
clasp push
```

After pushing, open the project in the Apps Script editor to test deployments.

---

## Coding Conventions

### General

- **Language:** Google Apps Script (JavaScript ES6 via V8 runtime).
- **Indentation:** 2 spaces.
- **Semicolons:** Always use them.
- **Variable declarations:** Use `var` for function-scoped variables (Apps Script Card Service callbacks sometimes behave unexpectedly with `let`/`const` in certain contexts). Use `const` for top-level configuration constants in `Config.gs`.

### File Organization

| File | Responsibility |
|---|---|
| `Config.gs` | All user-configurable constants (branding, categories, staff lists) and the one-time setup function. No business logic. |
| `Code.gs` | Entry points: `onHomepage()` and utility functions like `isITStaff()`. No card-building beyond the homepage. |
| `Cards.gs` | All Card Service UI builders. Every function that returns a card or action response belongs here. |
| `TicketService.gs` | All Google Sheets read/write operations. No UI code. |
| `NotificationService.gs` | All email logic and HTML template generation. No UI code. |

If you add a new feature, place the code in the file that matches its responsibility. If it does not fit cleanly, consider whether a new file is warranted and explain your reasoning in the pull request.

### Naming

- **Functions:** camelCase, verb-first (`showTicketDetail`, `sendTicketConfirmation`).
- **Constants:** UPPER_SNAKE_CASE (`SCHOOL_NAME`, `ACCENT_COLOR_PRIMARY`).
- **Card builder functions** that serve as Card Service action handlers must be top-level named functions (not arrow functions or nested functions), because Apps Script resolves them by name at runtime.

### Comments

- Every function should have a JSDoc-style comment explaining what it does.
- Inline comments for non-obvious logic.
- Do not comment obvious code.

### Branding

All branding values must come from `Config.gs` constants. Never hardcode colors, school names, or logo URLs in other files.

---

## Testing Checklist

Before submitting a pull request, verify:

- [ ] **Staff flow:** Submit a new ticket, confirm it appears in the spreadsheet, confirm the confirmation email arrives.
- [ ] **IT flow:** View the queue, open a ticket, change status, assign, add notes, save. Confirm the submitter receives a status update email.
- [ ] **Branding:** Change `SCHOOL_NAME`, `SCHOOL_LOGO_URL`, and accent colors in `Config.gs`. Verify the sidebar header, button colors, and email templates all reflect the new values.
- [ ] **Edge cases:** Submit with missing required fields (should show validation error). Access IT views as a non-IT user (should show "Access denied"). View "My Tickets" with zero tickets (should show empty state).
- [ ] **Spreadsheet:** Verify new tickets appear with correct formatting, conditional formatting works for priority, and the Activity Log records entries.

---

## Pull Request Review

Maintainers will review pull requests for:

1. **Correctness:** Does it work as described?
2. **Separation of concerns:** Is UI code in `Cards.gs`, data code in `TicketService.gs`, etc.?
3. **Branding compliance:** Are all visual values sourced from `Config.gs`?
4. **User experience:** Is the Card Service UI clear and accessible for non-technical school staff?
5. **Email safety:** Do HTML emails have plain-text fallbacks? Are user inputs escaped?

---

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
