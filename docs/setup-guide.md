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
```

Edit `backend/.env`:

- `DATABASE_URL` — your PostgreSQL connection
- `JWT_SECRET` — long random string
- `FRONTEND_URL` — `http://localhost:5500` (local) or `https://sonics-gem-trust.vercel.app` (production)
- `PORT=5001`

```bash
npm run db:push
npm run db:generate
npm run dev
```

Startup should show:

```
✅ PostgreSQL connected
✅ Server running on port 5001
✅ CORS enabled
✅ Email service ready / fallback mode
```

Health check: http://localhost:5001/api/health

## Frontend Setup (local)

```bash
npx serve frontend -p 5500
```

Open http://localhost:5500 or http://localhost:5500/pages/login.html

The frontend automatically uses `http://localhost:5001/api` on localhost.

## Public API (ngrok + mobile)

```bash
ngrok http 5001
```

Set in `backend/.env`:

```env
API_PUBLIC_URL=https://YOUR-SUBDOMAIN.ngrok-free.dev
FRONTEND_URL=https://sonics-gem-trust.vercel.app
```

Set in **Vercel** → `SGT_API_URL=https://YOUR-SUBDOMAIN.ngrok-free.dev/api` and redeploy.

See [deployment.md](deployment.md) for full details.

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

- Email failures **do not** block registration or server startup.
- Verification tokens are logged in the console during development.

## Cloudinary (Optional)

Set Cloudinary env vars for profile image uploads. Without them, images save locally under `backend/src/uploads`.
