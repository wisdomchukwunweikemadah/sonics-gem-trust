# SGT Wallet — Deployment & Operations

## URLs

| Service | URL |
|---------|-----|
| Frontend | https://sonics-gem-trust.vercel.app |
| API (ngrok) | https://dole-embolism-trustless.ngrok-free.dev/api |

## Environment variables

### Backend (`backend/.env`)

```env
PORT=5001
NODE_ENV=production
DATABASE_URL=postgresql://...
JWT_SECRET=long_random_secret_32plus
FRONTEND_URL=https://sonics-gem-trust.vercel.app
API_PUBLIC_URL=https://YOUR-SUBDOMAIN.ngrok-free.dev
```

**Important:** `PORT` must be numeric only (`5001`), never a URL.

### Vercel

```env
SGT_API_URL=https://YOUR-SUBDOMAIN.ngrok-free.dev/api
```

## Run locally

```bash
cd backend && npm install && npm run dev
npx serve frontend -p 5500
```

## ngrok

```bash
ngrok http 5001
```

Update `SGT_API_URL` (Vercel), `API_PUBLIC_URL` (backend `.env`), redeploy frontend.

## API config (frontend)

Load order on every page:

1. `head-api.js` — forces production API on Vercel
2. `config.js` — centralized `SGT_CONFIG`
3. `sgt-wallet.js` — all `api()` calls

## Redeploy Vercel

1. Push to GitHub
2. Set `SGT_API_URL`
3. Redeploy (clear cache)
4. On mobile: clear site data or use private tab

## Update ngrok later

- Vercel env `SGT_API_URL` + redeploy, or
- Browser: `SGT_CONFIG.setApiOverride('https://NEW.ngrok-free.dev/api'); location.reload();`

## Health check

`GET /api/health` → `{ "success": true, "status": "SGT Wallet API Running" }`
