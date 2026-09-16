# Habit Tracker

A full-stack habit tracking application built with React, Vite, Express, PostgreSQL, and JWT authentication.

## Features

- User registration and login
- Daily and weekly habit scheduling
- Dashboard filtered to habits scheduled for today
- Mark habits complete/incomplete by date
- Current streak and best streak tracking
- Habit editing and archiving
- Search, restore, and history views
- Responsive UI with loading and error states

## Tech stack

- Frontend: React, Vite, React Router, Axios, CSS
- Backend: Node.js, Express.js, PostgreSQL, JWT, bcrypt

## Environment variables

Create a server environment file from the example:

cp server/.env.example server/.env

Then update the values for your local PostgreSQL and JWT secret:

PORT=5000
DATABASE_URL=postgresql://postgres:password@localhost:5432/habit_tracker
JWT_SECRET=your_secret_here

## Database setup

1. Start PostgreSQL.
2. Create the database:

createdb habit_tracker

3. Initialize the schema from the SQL file:

psql -U postgres -d habit_tracker -f server/src/sql/schema.sql

## Run the project

Install dependencies:

npm install
npm install --prefix client
npm install --prefix server

Start the app:

npm run dev

This runs both the frontend and backend concurrently.

## Backend scripts

npm --prefix server run dev

## Frontend scripts

npm --prefix client run dev

## API endpoints

- GET /api/health
- POST /api/auth/register
- POST /api/auth/login
- GET /api/habits
- GET /api/habits/today
- POST /api/habits
- GET /api/habits/:id
- PUT /api/habits/:id
- PATCH /api/habits/:id/archive
- PATCH /api/habits/:id/restore
- DELETE /api/habits/:id
- POST /api/habits/:id/log
- GET /api/habits/:id/logs
- GET /api/habits/:id/streak

## Known limitations

- This demo uses a single local PostgreSQL instance for development.
- The UI is intentionally simple and focused on the habit workflow rather than extra analytics.
- Calendar rendering is month-based and intended for quick habit history review.

## Notes

The backend auto-runs the schema initialization on startup when the database is available.
