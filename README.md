# Stock Transfer Management

Full-stack web app to manage stock transfers between warehouses.

## Live demo

| | URL |
|---|---|
| **Frontend** | https://stock-transfer-management-flax.vercel.app |
| **API** | https://stock-transfer-management-vlvq.onrender.com |
| **Health check** | https://stock-transfer-management-vlvq.onrender.com/api/health |

**Demo login** (after seeding Atlas):

- Email: `demo@stock.app`
- Password: `Demo@123`

If login fails on the live site, either **Register** a new account or run `npm run seed` locally (uses Atlas via `backend/.env`). Seed resets users/warehouses/transfers.

> Render free tier sleeps when idle — the first API request after idle can take 30–60 seconds.

## Stack

- **Frontend:** Angular 19
- **Backend:** Node.js + Express
- **Database:** MongoDB Atlas (Mongoose)
- **Auth:** JWT (`bcryptjs` + `jsonwebtoken`)
- **Hosting:** Vercel (frontend) + Render (API)

## Project structure

```
backend/     Express API
frontend/    Angular app
render.yaml  Render service config
```

## Features

- [x] JWT login / register
- [x] Dashboard (counts + **5** recent transfers)
- [x] Create / edit / delete warehouses
- [x] Add / edit / delete stock items
- [x] Create stock transfer requests (SKU picker from source stock)
- [x] Transfer status flow with confirm dialogs
- [x] Stock updates only when transfer is **COMPLETED**
- [x] Transfer timeline (status history)
- [x] Pagination on warehouse list and transfer history
- [x] Filters: warehouse **location**; transfer **from** / **to** / **status**
- [x] Seed script for demo data
- [x] Live deployment (Vercel + Render)

### Transfer status rules

`PENDING` → `IN_TRANSIT` → `COMPLETED`  
or `CANCELLED` from `PENDING` / `IN_TRANSIT`.  
Stock moves **only** on `COMPLETED`. Cancel does not change stock.

## Setup (local)

### 1) Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

API: `http://localhost:5000`

Required `backend/.env` values:

```env
PORT=5000
MONGODB_URI=your-mongodb-atlas-uri/stock-transfer?...
CORS_ORIGIN=http://localhost:4200
NODE_ENV=development
JWT_SECRET=change-me-to-a-long-random-string
JWT_EXPIRES_IN=7d
```

Seed demo data (optional — **resets** collections):

```bash
cd backend
npm run seed
```

### 2) Frontend

```bash
cd frontend
npm install
npm start
```

App: `http://localhost:4200`

- Local host loads `frontend/public/config.json` → `http://localhost:5000/api`
- Production loads `frontend/public/config.production.json` → Render API

### Backend tests

```bash
cd backend
npm test
```

## Sample test flow

### Local

1. Start API + Angular (`npm run dev` / `npm start`)
2. `npm run seed` in `backend`
3. Open http://localhost:4200 → sign in with demo credentials
4. Check **Dashboard**
5. **Warehouses** — create/edit stock; try location search + pagination
6. **Transfers** — create via SKU picker; **Start** → **Complete**
7. Confirm stock changed; open **Timeline**
8. Filter history by From / To / Status

### Live

1. Open https://stock-transfer-management-flax.vercel.app
2. Sign in (or Register if demo user is missing)
3. Repeat the warehouse/transfer flow above

## API overview

### Auth

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | `{ name, email, password }` |
| POST | `/api/auth/login` | No | `{ email, password }` |
| GET | `/api/auth/me` | Yes | Current user |

### App

| Method | Path | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/dashboard/stats` | Dashboard counts + recent transfers |
| POST | `/api/warehouses` | Create warehouse |
| GET | `/api/warehouses` | List (`?page=&limit=&location=`) |
| GET | `/api/warehouses/options/all` | All warehouses (dropdowns) |
| GET | `/api/warehouses/:id` | Detail + stock |
| PUT | `/api/warehouses/:id` | Update warehouse |
| DELETE | `/api/warehouses/:id` | Delete warehouse |
| POST | `/api/warehouses/:id/stock` | Upsert stock |
| DELETE | `/api/warehouses/:id/stock/:sku` | Delete stock item |
| POST | `/api/transfers` | Create transfer |
| GET | `/api/transfers` | List (`?status=&fromWarehouseId=&toWarehouseId=&page=&limit=`) |
| GET | `/api/transfers/:id` | Transfer detail |
| PATCH | `/api/transfers/:id/status` | Update status `{ status }` |

Protected routes require header: `Authorization: Bearer <token>`.

## Deployment / redeploy

### Hosting

| Service | Role | URL |
|---|---|---|
| MongoDB Atlas | Database | — |
| Render | API | https://stock-transfer-management-vlvq.onrender.com |
| Vercel | Frontend | https://stock-transfer-management-flax.vercel.app |

### Render env vars

- `NODE_ENV=production`
- `MONGODB_URI=...`
- `JWT_SECRET=...`
- `JWT_EXPIRES_IN=7d`
- `CORS_ORIGIN=https://stock-transfer-management-flax.vercel.app,http://localhost:4200`

Atlas **Network Access** should allow `0.0.0.0/0` (so Render can connect).

### Redeploy

**Render**

1. Dashboard → your web service  
2. **Environment** → update vars if needed → Save  
3. **Manual Deploy** → **Deploy latest commit**

**Vercel**

1. Dashboard → project → **Deployments**  
2. Auto-deploys on push to `main`, or **Redeploy** latest  

Production API URL for the UI is in `frontend/public/config.production.json`.

## Repository

https://github.com/vamshijetti2005-web/stock-transfer-management
