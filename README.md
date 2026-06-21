# Basket 🛒

Grocery price comparison app. One tap shows you the real-time price of any grocery item across every major store in your area.

## Project Structure

- `frontend/`: React + Vite + Tailwind CSS (v4)
- `backend/`: Node.js + Express
- `shared/`: (via team-db) SQLite database schema

## Getting Started

1.  **Initialize the database**:
    ```bash
    npm run init-db
    ```

2.  **Run the application**:
    To run both backend and frontend concurrently:
    ```bash
    npm run dev
    ```
    *Note: If you encounter memory issues, run them separately.*

3.  **Run separately**:
    Backend:
    ```bash
    npm run backend
    ```
    Frontend:
    ```bash
    npm run frontend
    ```

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, React Router
- **Backend**: Node.js, Express, Axios, Cheerio
- **Database**: SQLite (via `team-db` CLI)

## Affiliate Links

The app supports affiliate link tracking for revenue generation. To configure affiliate IDs:
1. Copy `backend/.env.example` to `backend/.env`.
2. Fill in your affiliate IDs for each store (e.g., `AFFILIATE_ID_TARGET`).
3. Links in the UI will automatically be routed through the tracking service.

## Production Deployment

To prepare the app for production:
1. Build the frontend:
   ```bash
   npm run build
   ```
2. Start the production server:
   ```bash
   npm start
   ```
The backend will serve the built frontend static files from `frontend/dist`.

## Vercel Deployment

This project is prepared for deployment on Vercel.

1.  **Connect GitHub**: Import `bholliday90/basket` on [vercel.com/new](https://vercel.com/new).
2.  **Auto-deploy**: Vercel reads `vercel.json` — no manual config needed.
3.  **Environment Variables** (optional): Set affiliate IDs in Vercel dashboard → Project Settings → Environment Variables.
4.  **Database**: On Vercel, the app uses built-in mock data automatically (the `team-db` CLI is a platform tool that only works in development). All features work with realistic simulated prices.

## KPIs

- Monthly Active Users (MAU)
- Stores integrated (Target, Walmart, Kroger, Aldi, Costco, Sam's Club)
- Price accuracy rate
- Click-through rate to stores
