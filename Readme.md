# QuickDrop Frontend 

A vanilla HTML/CSS/JavaScript frontend that consumes the QuickDrop REST API — create delivery requests, view them all, filter by status, update status, and delete requests. No frameworks, no build step.

## How it works
- **`index.html`** — page structure and the create-delivery form
- **`css/style.css`** — styling; delivery cards show a route bar (pickup → dropoff) whose progress reflects the current status
- **`js/app.js`** — all `fetch()` calls to the API (GET, POST, PUT, DELETE) and DOM rendering logic

## Setup

1. Make sure the **QuickDrop API** (Level 1, Task 2) is running on `http://localhost:5000`.
2. Open `index.html` directly in your browser — no build tools or server needed for the frontend itself.
   - Alternatively, serve it with a simple local server (e.g. the VS Code "Live Server" extension) to avoid any `file://` CORS quirks.

If your API runs on a different port, update `API_BASE_URL` at the top of `js/app.js`.

## Features
- Create a new delivery request via a form
- View all delivery requests, newest first
- Filter the list by status (pending / picked up / in transit / delivered / cancelled)
- Update a delivery's status inline via dropdown
- Delete a delivery request (with confirmation)
- Basic input escaping to avoid HTML injection from entered text
- Responsive layout down to mobile widths
