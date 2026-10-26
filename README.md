# iMovies — Movie Ticket Booking Made Easy

A MERN starter project with a separate React frontend (`client/`) and Express/MongoDB backend (`server/`).

## Features
- Cinematic, responsive dark UI with vibrant violet/coral accents
- Movie search and genre filters
- Movie details and showtime selection
- Interactive seat selection and price calculation
- Booking creation and confirmation
- Express REST API and MongoDB/Mongoose models
- Optional JWT registration/login endpoints
- Demo movie data in the frontend if the backend is not running yet

> Demo note: The frontend's fallback data is for UI preview only. Real bookings are stored only when the backend is configured and reachable. Payments are not integrated.

## Requirements
- Node.js 20+ recommended
- MongoDB Atlas or local MongoDB
- VS Code (recommended)

## 1. Start the backend
```bash
cd server
npm install
```
Copy `.env.example` to `.env`, then set `MONGO_URI` and a long random `JWT_SECRET`.

```bash
npm run dev
```
Backend: `http://localhost:5000`
Health check: `http://localhost:5000/api/health`

Optional: seed sample movies into MongoDB:
```bash
npm run seed
```

## 2. Start the frontend (new terminal)
```bash
cd client
npm install
npm run dev
```
Open the Vite URL printed in the terminal (usually `http://localhost:5173`).

The frontend uses `VITE_API_URL=http://localhost:5000/api` by default. To override it, copy `client/.env.example` to `client/.env`.

## API overview
- `GET /api/health`
- `GET /api/movies`
- `GET /api/movies/:id`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/shows?movieId=<id>`
- `POST /api/bookings` — create a booking; validates seat availability
- `GET /api/bookings/:id` — fetch booking confirmation by booking ID

## Before deploying
- Configure a production MongoDB URI and frontend API URL.
- Use HTTPS and secure environment variables.
- Add rate limiting, email verification, proper booking expiry/locking, and payment-provider integration before production use.
- Never commit `.env` files.
