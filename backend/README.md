# SGT Wallet Backend

Sonic's Gem Trust — virtual wallet API (simulation only).

## Setup

1. Install PostgreSQL and create database `sgt_wallet`
2. Copy `.env.example` to `.env` and configure variables
3. Install dependencies: `npm install`
4. Push schema: `npm run db:push`
5. Generate client: `npm run db:generate`
6. Start server: `npm run dev`

## Create Admin User

After registering a user, promote in PostgreSQL:

```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'your@email.com';
```

## API Base

`http://localhost:5000/api`
