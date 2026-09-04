# Stock Transfer Management

Web app to manage stock transfers between warehouses.

## Stack

- **Frontend:** Angular
- **Backend:** Node.js + Express
- **Database:** MongoDB (Mongoose)

## Project structure

```
backend/    Express API
frontend/   Angular app
```

## Setup (local)

### Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

API runs at `http://localhost:5000`.

Seed demo data (optional, resets collections):

```bash
cd backend
npm run seed
```

Demo login after seed: `demo@stock.app` / `Demo@123`

Add `JWT_SECRET` to `backend/.env` (see `.env.example`).

### Frontend

```bash
cd frontend
npm install
npm start
```

App runs at `http://localhost:4200`.

## Features (in progress)

- [x] Create warehouses & maintain stock levels (API + UI)
- [x] Create stock transfer requests (API + UI)
- [x] Transfer status management (API + UI)
- [x] Update warehouse stock on completion (API + UI)
- [x] Display transfer list/history (UI)
- [x] Login / auth (JWT)
- [x] Seed script for demo data
- [x] SKU picker + confirm dialogs
- [x] Dashboard + transfer timeline
- [x] Production deploy config (Render + Vercel)
- [ ] Live URL published (after hosting accounts are connected)

## Backend API (Phase 1)

| Method | Path | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| POST | `/api/warehouses` | Create warehouse `{ name, code, location? }` |
| GET | `/api/warehouses` | List warehouses (`?page=&limit=&location=`) |
| GET | `/api/warehouses/options/all` | All warehouses for dropdowns |
| GET | `/api/warehouses/:id` | Warehouse detail + stock |
| PUT | `/api/warehouses/:id` | Update warehouse |
| DELETE | `/api/warehouses/:id` | Delete warehouse |
| POST | `/api/warehouses/:id/stock` | Upsert stock `{ sku, name, quantity }` |
| DELETE | `/api/warehouses/:id/stock/:sku` | Delete stock item |
| POST | `/api/transfers` | Create transfer |
| GET | `/api/transfers` | List transfers (`?status=&fromWarehouseId=&toWarehouseId=&page=&limit=`) |
| GET | `/api/transfers/:id` | Transfer detail |
| PATCH | `/api/transfers/:id/status` | Update status `{ status }` |

Transfer statuses: `PENDING` → `IN_TRANSIT` → `COMPLETED` (or `CANCELLED` from pending/in-transit). Stock moves only on `COMPLETED`.

### Backend tests

```bash
cd backend
npm test
```

## Live URL

_Pending first deploy. Follow **Deployment** below, then paste the Vercel URL here._

## Deployment (Phase 3)

Stack hosting:
- **MongoDB Atlas** — already set up
- **Render** — backend API
- **Vercel** — Angular frontend

### 0) Push latest code to GitHub

Phase 1–2 work must be committed and pushed before Render/Vercel can build from the repo.

### 1) Deploy API on Render

1. Go to https://dashboard.render.com → **New** → **Web Service**
2. Connect `vamshijetti2005-web/stock-transfer-management`
3. Settings:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance:** Free
4. Environment variables:
   - `NODE_ENV` = `production`
   - `MONGODB_URI` = your Atlas connection string (`.../stock-transfer?...`)
   - `JWT_SECRET` = a long random string
   - `JWT_EXPIRES_IN` = `7d`
   - `CORS_ORIGIN` = leave temporarily as `http://localhost:4200` (update after Vercel URL exists)
5. Deploy → copy the API URL, e.g. `https://stock-transfer-api.onrender.com`
6. Verify: `https://YOUR-API.onrender.com/api/health`
7. Optional: in Render Shell / local with production URI run `npm run seed`

Atlas **Network Access** must allow `0.0.0.0/0` so Render can connect.

### 2) Point frontend at the API

Edit `frontend/public/config.json` (used in production build/hosting):

```json
{
  "apiUrl": "https://YOUR-API.onrender.com/api"
}
```

Commit and push that change (or set it before the Vercel deploy).

### 3) Deploy frontend on Vercel

1. Go to https://vercel.com → **Add New Project**
2. Import the same GitHub repo
3. Settings:
   - **Root Directory:** `frontend`
   - Framework: Angular (or Other)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist/frontend/browser`
4. Deploy → copy the site URL, e.g. `https://stock-transfer-xxx.vercel.app`

`frontend/vercel.json` already includes SPA rewrites.

### 4) Finish CORS

In Render → Environment → set:

```text
CORS_ORIGIN=https://YOUR-FRONTEND.vercel.app,http://localhost:4200
```

Redeploy the API (or restart).

### 5) Smoke test live app

1. Open the Vercel URL
2. Login: `demo@stock.app` / `Demo@123` (after seed)
3. Dashboard → create/complete a transfer

**Note:** Render free tier sleeps after idle; first request may take ~30–60s.

## Sample test flow

1. Start backend (`cd backend && npm run dev`) and frontend (`cd frontend && npm start`)
2. Run `npm run seed` in backend (optional but recommended)
3. Open http://localhost:4200 and sign in (`demo@stock.app` / `Demo@123`)
4. Check **Dashboard** counts
5. Open **Warehouses** / **Transfers**
6. Create a transfer using the SKU picker from source stock
7. Click **Start** → confirm → **Complete** → confirm
8. Open **Timeline** on the transfer row and verify stock changed
