# SGT Wallet — Setup Guide

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm

## Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit DATABASE_URL and JWT_SECRET in .env
npm run db:push
npm run db:generate
npm run dev
```

API runs at `https://dole-embolism-trustless.ngrok-free.dev/api`

## Frontend Setup

Serve the `frontend` folder with any static server:

```bash
# VS Code Live Server extension, or:
npx serve frontend -p 5500
```

Open `http://127.0.0.1:5500` (landing page) or `http://127.0.0.1:5500/pages/login.html`

## Create Admin

Register a user, then in PostgreSQL:

```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'your@email.com';
```

## Email (Gmail SMTP)

1. Enable 2-Step Verification on your Google account.
2. Create an **App Password**: https://myaccount.google.com/apppasswords
3. In `backend/.env`:

```env
EMAIL_USER=your.email@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx
EMAIL_FROM="SGT Wallet <your.email@gmail.com>"
```

- `EMAIL_USER` must be your **full Gmail address** (not a display name).
- Spaces in the app password are stripped automatically.
- On `npm run dev`, the server logs `[Mail] Gmail SMTP verified` or a clear error.
- Registration still completes if email fails; verification tokens are logged in development.

## Cloudinary (Optional)

Set Cloudinary env vars for profile image uploads. Without them, images save locally under `backend/src/uploads`.
