# Sonic's Gem Trust (SGT Wallet)

A full-stack **simulation** virtual wallet — send Gems, convert to USSD, track transactions, and manage profiles in a premium fintech-style UI.

> No real money or payment gateways. For portfolio and educational use only.

## Live URLs

| Service | URL |
|---------|-----|
| Frontend | https://sonics-gem-trust.vercel.app |
| API (via ngrok) | https://dole-embolism-trustless.ngrok-free.dev/api |

## Stack

- **Frontend:** HTML, CSS, Vanilla JavaScript (Vercel static)
- **Backend:** Node.js, Express, Prisma, PostgreSQL
- **Integrations:** JWT, Gmail SMTP, Cloudinary, ngrok

## Quick Start (local)

```bash
# Backend
cd backend && npm install && cp .env.example .env
npm run db:push && npm run dev

# Frontend (new terminal)
npx serve frontend -p 5500
```

Open http://localhost:5500/pages/login.html — API defaults to `http://localhost:5001/api`.

## Deployment

See **[docs/deployment.md](docs/deployment.md)** for Vercel (static, no build), ngrok, env vars, and mobile testing.

See **[docs/setup-guide.md](docs/setup-guide.md)** for database, admin, and email setup.

## Features

- JWT auth with auto-login and dashboard redirect after registration
- Wallet: send Gems, convert 100 Gems → 1 USSD, signup bonus 1000 Gems
- Admin panel: gift gems, adjust balances, user search
- Profile photos (Cloudinary or local uploads)
- Email verification with dedicated success page and resend
- Light / dark themes, live balance refresh, activity feed, charts

## Project Structure

```
sonics-gem-trust/
├── backend/          # Express API + Prisma
├── frontend/         # Static web app (Vercel)
├── scripts/          # Dev utilities (optional env generator)
├── vercel.json       # Static deploy from /frontend
└── docs/             # Setup, API, deployment
```

## License

MIT
