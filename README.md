# Sonic's Gem Trust (SGT Wallet)

A full-stack **simulation** virtual wallet — send Gems, convert to USSD, track transactions, and manage profiles in a premium fintech-style UI.

> ⚠️ No real money or payment gateways. For portfolio and educational use only.

## Live URLs

| Service | URL |
|---------|-----|
| Frontend | https://sonics-gem-trust.vercel.app |
| API (via ngrok) | https://dole-embolism-trustless.ngrok-free.dev/api |

## Stack

- **Frontend:** HTML, CSS, Vanilla JavaScript (Vercel)
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

Open http://localhost:5500/pages/login.html

## Deployment

See **[docs/deployment.md](docs/deployment.md)** for Vercel, ngrok, env vars, and mobile testing.

See **[docs/setup-guide.md](docs/setup-guide.md)** for database, admin, and email setup.

## Features

- JWT auth with auto-login after registration
- Wallet: send Gems, convert 100 Gems → 1 USSD, signup bonus 1000 Gems
- Transaction history, charts, admin panel
- Light / Dark / AMOLED themes, responsive UI
- Production API config (`config.js`) — no localhost on Vercel

## Project Structure

```
sonics-gem-trust/
├── backend/          # Express API + Prisma
├── frontend/         # Static web app
├── scripts/          # Vercel build (generate-frontend-env.js)
├── vercel.json       # Vercel routing & build
└── docs/             # Setup, API, deployment
```

## License

MIT
