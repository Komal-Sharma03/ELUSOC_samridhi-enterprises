# Environment Variables

This is a developer reference for every environment variable the application
reads. Step-by-step provider setup (MongoDB Atlas, Cloudinary, Brevo) and the
deployment guide live in the root [`README.md`](../README.md); this page focuses
on **what each variable is and where it is used**.

Each package loads its own `.env`:

- Backend → `server/.env`
- Frontend → `client/.env`

Never commit real secrets. Use the `.env.example` templates (referenced in the
root README) as the starting point.

---

## Backend — `server/.env`

| Variable | Required | Used by | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `index.js` | Port the API listens on. Defaults to `5000`. |
| `MONGODB_URL` | **Yes** | `config/connectDB.js` | MongoDB connection string (e.g. a MongoDB Atlas SRV URI). |
| `JWT_SECRET` | **Yes** | `utils/jwtToken.js`, `middleware/auth.js`, `middleware/Admin.js` | Secret used to sign and verify JWTs. |
| `JWT_EXPIRE` | **Yes** | `models/userModel.js` (`getJWTToken`) | JWT lifetime, e.g. `7d`. |
| `COOKIE_EXPIRE` | **Yes** | `utils/jwtToken.js` | Auth-cookie lifetime in **days** (used as `COOKIE_EXPIRE × 24h`). |
| `NODE_ENV` | No | `utils/jwtToken.js` | `development` or `production`. In production the auth cookie is `secure` and `sameSite: "None"`. |
| `FRONTEND_URL` | **Yes** | `index.js` (CORS) | Primary allowed browser origin for CORS. |
| `FRONTEND_WWW_URL` | No | `index.js` (CORS) | Additional allowed origin (e.g. the `www.` variant). |
| `CLOUDINARY_NAME` | **Yes** | `index.js` (Cloudinary config) | Cloudinary cloud name. |
| `CLOUDINARY_API_KEY` | **Yes** | `index.js` (Cloudinary config) | Cloudinary API key. |
| `CLOUDINARY_API_SECRET` | **Yes** | `index.js` (Cloudinary config) | Cloudinary API secret. |
| `BREVO_API_KEY` | **Yes** | Email sending (`sib-api-v3-sdk`) | Brevo (Sendinblue) API key used to send OTP / transactional email. |

> `http://localhost:5173` (the Vite dev origin) is always allowed by CORS in
> addition to `FRONTEND_URL` / `FRONTEND_WWW_URL`, so local development works
> without extra configuration.

---

## Frontend — `client/.env`

| Variable | Required | Used by | Description |
|----------|----------|---------|-------------|
| `VITE_BACKEND_URL` | **Yes** | Axios API client | Base URL of the backend API the SPA calls. Vite only exposes variables prefixed with `VITE_` to client code. |

For local development this is typically `http://localhost:5000`.

---

## Quick start (local)

```env
# server/.env
PORT=5000
MONGODB_URL=mongodb+srv://<user>:<pass>@<cluster>/<db>
JWT_SECRET=replace-with-a-long-random-string
JWT_EXPIRE=7d
COOKIE_EXPIRE=7
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
CLOUDINARY_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret
BREVO_API_KEY=your-brevo-key
```

```env
# client/.env
VITE_BACKEND_URL=http://localhost:5000
```

> When you introduce a new `process.env.*` (server) or `import.meta.env.VITE_*`
> (client) reference, add it to this table and to the relevant `.env.example` in
> the same PR.
