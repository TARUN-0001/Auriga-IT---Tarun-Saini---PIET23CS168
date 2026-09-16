# Solution Reasoning

## Goal

The project is a full-stack habit tracker with account authentication, scheduled habits, completion logs, streaks, archive and restore support, search, and a responsive browser interface.

## Architecture

The application is split into a React/Vite client and an Express/PostgreSQL server. React Router owns the page-level navigation, Axios centralizes API requests, and the authentication context keeps the JWT-backed session available to protected pages. Express routes delegate authentication and habit operations to controllers, while PostgreSQL stores users, habits, schedules, and completion logs.

## Authentication Decisions

Passwords are hashed with bcrypt before storage. Login and registration return a signed JWT together with the user profile. Protected API routes read the bearer token through authentication middleware and reject requests without a valid session. The client stores the token and sends it with subsequent API requests.

During local testing, browser authentication initially failed even though direct API requests worked. The cause was the client using a hardcoded backend URL in an environment where the browser accessed the frontend through a forwarded development port. The client now uses the same-origin `/api` path, and Vite proxies that path to the Express server. This keeps browser requests on the frontend origin while still reaching the backend.

## Habit and Streak Logic

Habits store their frequency and scheduled days separately from completion logs. The dashboard asks the server for habits scheduled for the current date. Logging a habit is date-specific and can be toggled. Current and best streaks are calculated from completed dates while respecting the habit's scheduled days, so unscheduled days do not incorrectly break a streak.

## Data Model

The PostgreSQL schema uses separate tables for users, habits, habit schedules, and habit logs. Foreign keys associate every habit and log with its owner, and cascading relationships keep dependent schedule and log records consistent when a habit is removed.

## Verification

The following checks were used during implementation:

- The server health endpoint returned `{"message":"Habit Tracker API is running"}`.
- The frontend served successfully from port 5173.
- The Vite proxy returned the same health response through `/api/health`.
- Registration and login returned JWT tokens through the proxied API path.
- The client production build completed successfully.
- Port conflicts were resolved by stopping duplicate development processes and starting one frontend and one backend instance.

## Local Execution

Install the root, client, and server dependencies, configure `server/.env` with PostgreSQL and JWT values, then run `npm run dev`. The development frontend is available at `http://localhost:5173` and the API listens on port 5000.

## Scope Note

This document records the observable engineering decisions and verification used to build the solution. It does not reproduce private hidden chain-of-thought; implementation rationale, code, tests, and runtime evidence are the appropriate auditable artifacts.
