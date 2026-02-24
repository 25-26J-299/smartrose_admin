# SmartRose Admin Dashboard

React (Vite) web app for SmartRose platform administration. Manage users, greenhouses, devices, view analytics, system health, and audit logs.

## Tech stack

- **React 18** + **TypeScript**
- **Vite** — build tool and dev server
- **React Router 6** — client-side routing
- **Tailwind CSS** — styling
- **Recharts** — charts
- **Lucide React** — icons

## Commands

```bash
npm install   # Install dependencies
npm run dev   # Start dev server (http://localhost:5173)
npm run build # Production build → output in dist/
npm run preview # Preview production build locally
```

## Routes

| Path | Page |
|------|------|
| `/login` | Admin sign-in |
| `/overview` | Dashboard (stats, charts, recent activity) |
| `/users` | User management |
| `/greenhouses` | Greenhouse management |
| `/devices` | Device registry |
| `/analytics` | Platform analytics (tabs: sensors, predictions, users, alerts) |
| `/system` | System health (services, DB, metrics) |
| `/audit-logs` | Admin action logs |

## Backend integration

**Users page** fetches real data from `GET /api/v1/admin/users`. Other pages still use mock data.

### Setup

1. **API URL**: Create `.env.local` in the project root:
   ```
   VITE_API_BASE_URL=http://localhost:8000/api/v1
   ```
   (Default is `http://localhost:8000/api/v1` if not set.)

2. **First admin user**: Promote an existing user to admin in MongoDB:
   ```javascript
   db.users.updateOne(
     { email: "your@email.com" },
     { $set: { roles: ["admin"] } }
   )
   ```
   Or add `"admin"` to the `roles` array of any user. Then log in with that user in the admin dashboard.

### Connecting more data

1. Add endpoints to the FastAPI backend (e.g. `/admin/greenhouses`, `/admin/devices`).
2. Add fetch functions in `src/lib/api.ts`.
3. Replace mock data imports with API calls in each page.

## Deploy (static)

After `npm run build`, serve the `dist/` folder with any static host. You can also mount it under FastAPI:

```python
from fastapi.staticfiles import StaticFiles
app.mount("/admin", StaticFiles(directory="smartrose_admin/dist", html=True), name="admin")
```

Then open `https://yourserver.com/admin`.
