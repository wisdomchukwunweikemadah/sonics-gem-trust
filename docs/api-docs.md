# SGT Wallet API Documentation

Base URL: `http://localhost:5001/api` (local) or your ngrok URL + `/api` (production)

All protected routes require header: `Authorization: Bearer <token>`

## Auth

| Method | Endpoint | Body |
|--------|----------|------|
| POST | `/auth/register` | `{ username, email, password }` |
| POST | `/auth/login` | `{ email, password }` |
| POST | `/auth/verify-email` | `{ token }` |
| POST | `/auth/request-reset` | `{ email }` |
| POST | `/auth/reset-password` | `{ token, password }` |
| POST | `/auth/logout` | — (protected) |

## User

| Method | Endpoint | Body |
|--------|----------|------|
| GET | `/user/profile` | — |
| PUT | `/user/update` | `{ username?, profileImage? }` |
| POST | `/user/avatar` | `multipart/form-data` field `avatar` |

## Wallet

| Method | Endpoint | Body |
|--------|----------|------|
| GET | `/wallet/balance` | — |
| POST | `/wallet/send` | `{ recipientWalletId, amount, reference? }` |
| POST | `/wallet/convert` | `{ gemsAmount, reference? }` |
| POST | `/wallet/convert-to-gems` | `{ ussdAmount, reference? }` |

## Transactions

| Method | Endpoint | Query |
|--------|----------|-------|
| GET | `/transactions` | `type`, `page`, `limit` |
| GET | `/transactions/activity` | — |

## Admin

| Method | Endpoint | Body |
|--------|----------|------|
| GET | `/admin/users` | — |
| GET | `/admin/stats` | — |
| PATCH | `/admin/balance` | `{ userId, gemBalance?, ussdBalance? }` |

## Response Format

```json
{
  "success": true,
  "message": "Transfer successful",
  "data": {}
}
```
