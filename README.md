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

### Frontend

```bash
cd frontend
npm install
npm start
```

App runs at `http://localhost:4200`.

## Features (in progress)

- [ ] Create warehouses & maintain stock levels
- [ ] Create stock transfer requests
- [ ] Transfer status management
- [ ] Update warehouse stock on completion
- [ ] Display transfer list/history

## Live URL

_Coming after deployment._

## Sample test flow

_Coming after core features are built._
