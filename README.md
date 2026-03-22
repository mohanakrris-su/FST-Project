# Smart Care Q Admin + AI Module

This is a standalone project focused only on:

- Admin authentication
- Admin dashboard pages
- Expected consultation time prediction
- Queue wait-time prediction
- Analytics APIs and admin analytics UI

It is intentionally separate from the other four folders in `smartq`.

## Structure

- `backend/` Express + MongoDB API
- `frontend/` React + Vite admin app

## Backend Setup

1. Copy `backend/.env.example` to `backend/.env`
2. Update the MongoDB URI and JWT secret
3. Install packages:

```bash
cd backend
npm install
```

4. Start backend:

```bash
npm run dev
```

Backend runs on `http://localhost:4001` by default.

## Frontend Setup

1. Install packages:

```bash
cd frontend
npm install
```

2. Start frontend:

```bash
npm run dev
```

Frontend runs on `http://localhost:5173` by default.

## First Login

If there is no admin in the database, the frontend shows a bootstrap form.

Default bootstrap key:

```text
smartcareq-admin-bootstrap
```

You can change it in `backend/.env`.

## Real Data

This project no longer includes demo seed scripts.

- Create the first admin from the bootstrap form
- Use your real database records for doctors, queues, and appointments
- Analytics and prediction screens will populate once real data exists
