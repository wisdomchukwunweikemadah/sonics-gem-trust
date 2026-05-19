# SGT Wallet — Email Templates

Premium responsive HTML emails for fintech-style notifications.

## Templates

| Template | Trigger | File |
|----------|---------|------|
| **Verification** | User registers | `verificationEmail` |
| **Password reset** | Reset requested | `passwordResetEmail` |
| **Login alert** | Successful login | `loginAlertEmail` |
| **Profile picture** | Avatar uploaded | `profilePictureEmail` |
| **Convert to Gems** | USSD → Gems | `convertToGemsEmail` |
| **Convert to USSD** | Gems → USSD | `convertToUssdEmail` |
| **About / Welcome** | Registration | `aboutEmail` |

## Source

- Layout & components: `backend/src/emails/layout.js`
- Templates: `backend/src/emails/templates.js`
- Dispatcher: `backend/src/services/emailNotificationService.js`

## Preview locally

```bash
cd backend
node scripts/preview-emails.js
```

Open HTML files in `docs/email-previews/`.

## Design features

- Table-based responsive layout (600px max width)
- Dark fintech theme matching SGT brand colors
- Gradient header, stat cards, detail tables, alert boxes
- Preheader text for inbox snippets
- Plain-text fallbacks for all templates
