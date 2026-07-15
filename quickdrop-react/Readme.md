# QuickDrop React Frontend (Level 2, Task 1)

A React (Vite) rebuild of the QuickDrop frontend, now with authentication and role-based dashboards.

## What changed from Level 1
- Rebuilt as component-based React instead of vanilla JS
- Login/signup screens (`AuthPage.jsx`)
- Auth state (token + user) shared app-wide via `AuthContext`
- Two different dashboards depending on the logged-in role:
  - **Customer**: create delivery requests, view/filter their own, cancel or delete them
  - **Courier**: view all requests, claim one by updating its status, move it through the pipeline

## Setup

1. Make sure the **QuickDrop API** (with auth) is running on `http://localhost:5000`.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy the env file:
   ```bash
   cp .env.example .env
   ```
   (Only change `VITE_API_URL` if your API runs somewhere other than `localhost:5000`.)
4. Start the dev server:
   ```bash
   npm run dev
   ```
5. Open the URL Vite prints (usually `http://localhost:5173`).

## Trying it out

1. Sign up as a **customer** — create a delivery request.
2. Open a second browser (or an incognito window) and sign up as a **courier**.
3. As the courier, you'll see the customer's request in the list — pick a new status to "claim" and move it through the pipeline (`pending → picked_up → in_transit → delivered`).
4. Switch back to the customer tab and refresh — the status/progress bar updates.

## Notes
- The auth token is kept in React state only (not localStorage), so refreshing the page logs you out. This is intentional for this stage — persistent sessions are a natural Level 3 addition.
- Project structure:
  ```
  src/
  ├── api/client.js          # all fetch() calls to the backend, in one place
  ├── context/AuthContext.jsx  # shared login state
  ├── components/            # DeliveryForm, DeliveryCard, DeliveryList, Navbar
  ├── pages/                 # AuthPage, CustomerDashboard, CourierDashboard
  └── App.jsx                # decides what to render based on auth + role
  ```
