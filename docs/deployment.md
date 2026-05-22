# SGT Wallet — Production Deployment

## URLs

| Service | URL |
|---------|-----|
| Frontend (Vercel) | https://sonics-gem-trust.vercel.app |
| API (ngrok) | https://dole-embolism-trustless.ngrok-free.dev/api |

When your ngrok URL changes, update:

1. `frontend/assets/js/head-api.js` — `PROD` constant
2. `frontend/assets/js/config.js` — `PRODUCTION_API` constant
3. `<meta name="sgt-api-base" content="...">` in HTML pages (optional; head-api overrides on production)
4. `backend/.env` — `API_PUBLIC_URL` (no `/api` suffix)

---

## Frontend (Vercel)

The frontend is **static** — no build step required.

### Option A — Repository root

1. Connect the repo to Vercel.
2. **Root Directory:** leave empty (project root).
3. **Framework Preset:** Other
4. **Build Command:** leave empty
5. **Output Directory:** `frontend`
6. Deploy.

Uses root `vercel.json` (no `generate-frontend-env.js`).

### Option B — Frontend folder as root

1. Set **Root Directory** to `frontend`.
2. **Build Command:** leave empty
3. **Output Directory:** `.` (default)

Uses `frontend/vercel.json`.

### Cache busting

Script tags use `?v=6`. Bump the version after API URL changes to force mobile browsers to reload JS.

---

## Backend (local + ngrok)

```bash
cd backend
cp .env.example .env
# Edit DATABASE_URL, JWT_SECRET, FRONTEND_URL, API_PUBLIC_URL, email, Cloudinary
npm install
npm run db:push
npm run dev
```

Expose port 5001:

```bash
ngrok http 5001
```

Set in `backend/.env`:

```env
NODE_ENV=production
FRONTEND_URL=https://sonics-gem-trust.vercel.app
API_PUBLIC_URL=https://YOUR-SUBDOMAIN.ngrok-free.dev
```

Restart the backend after changing `.env`.

---

## Required environment variables

| Variable | Example |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | 32+ character secret |
| `FRONTEND_URL` | `https://sonics-gem-trust.vercel.app` |
| `API_PUBLIC_URL` | `https://YOUR-SUBDOMAIN.ngrok-free.dev` |
| `EMAIL_USER` | Gmail address |
| `EMAIL_PASS` | Google App Password |
| `CLOUDINARY_*` | Optional; local `/uploads` used if unset |

---

## Verification checklist

- [ ] https://sonics-gem-trust.vercel.app loads
- [ ] Register → auto-redirect to dashboard with JWT
- [ ] Admin gift gems works (no “Wallet not found”)
- [ ] Profile photo upload works
- [ ] Mobile browser Network tab shows ngrok API (not localhost)
- [ ] `GET https://YOUR-NGROK/api/health` returns success

---

## Troubleshooting

**Mobile still calls localhost**

- Clear site data / hard refresh on the phone.
- Confirm `head-api.js` and `config.js` are loaded (not cached `app.js`).
- Remove any `sgt_api_base` from localStorage (production clears this automatically).

**Vercel build fails on generate-frontend-env.js**

- Remove the build command in Vercel project settings.
- Use the static `vercel.json` in this repo (no build step).

**Profile images broken**

- Set `API_PUBLIC_URL` to your ngrok root URL.
- Or configure Cloudinary credentials in `backend/.env`.

**CORS errors**

- Set `FRONTEND_URL=https://sonics-gem-trust.vercel.app` in backend `.env`.
- Restart the API after changes.
