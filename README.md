# Sonic's Gem Trust (SGT Wallet)

A full-stack **simulation** virtual wallet — send Gems, convert to USSD, track transactions, and manage profiles in a premium fintech-style UI.

> ⚠️ No real money or payment gateways. For portfolio and educational use only.

## Stack

- **Frontend:** HTML, CSS, Vanilla JavaScript, Chart.js, Toastify
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL, Prisma ORM

## Quick Start

See [docs/setup-guide.md](docs/setup-guide.md) and [docs/api-docs.md](docs/api-docs.md).

```bash
cd backend && npm install && npm run db:push && npm run dev
# Serve frontend/ on port 5500
```

## Features

- JWT auth, bcrypt, email verification, password reset, rate limiting
- Wallet: send Gems, convert 100 Gems → 1 USSD, signup bonus 1000 Gems
- Transaction history and weekly charts
- Admin panel for users and balance adjustments
- Light / Dark / AMOLED themes, responsive glassmorphism UI

## Project Structure

```
sonics-gem-trust/
├── backend/     # Express API + Prisma
├── frontend/    # Static web app
└── docs/        # Setup & API docs
```

## License

MIT
