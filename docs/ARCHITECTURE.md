# Architecture Overview

Samridhi Enterprises is a **MERN** vehicle spare-parts e-commerce application
split into two deployables:

- **`client/`** — a React (Vite) single-page app.
- **`server/`** — an Express REST API backed by MongoDB (Mongoose).

Images are stored on **Cloudinary**; transactional email (OTPs) is sent through
**Brevo** (`sib-api-v3-sdk`).

---

## High-level layout

```
┌─────────────────────────────┐         ┌──────────────────────────────┐
│           CLIENT            │  HTTPS  │            SERVER            │
│  React + Vite SPA           │ ──────► │  Express REST API (/api/*)   │
│                             │  JSON / │                              │
│  • Redux Toolkit (state)    │  multipart                            │
│  • React Router (routing)   │         │  Route → Middleware →        │
│  • Axios (HTTP, Bearer)     │ ◄────── │  Controller → Model          │
│  • Tailwind CSS (styling)   │  JSON   │                              │
└─────────────────────────────┘         └───────────────┬──────────────┘
                                                         │
                          ┌──────────────────────────────┼───────────────────┐
                          ▼                               ▼                   ▼
                 ┌─────────────────┐            ┌──────────────────┐  ┌──────────────┐
                 │  MongoDB Atlas  │            │   Cloudinary     │  │    Brevo     │
                 │   (Mongoose)    │            │ (image storage)  │  │ (email OTP)  │
                 └─────────────────┘            └──────────────────┘  └──────────────┘
```

---

## Backend layers

The server follows a conventional layered structure under `server/`:

| Layer | Directory | Responsibility |
|-------|-----------|----------------|
| Entry | `index.js` | Loads env, configures middleware (CORS, cookies, JSON), Cloudinary, mounts routers, connects to DB, starts listening |
| Config | `config/` | `connectDB.js` (Mongoose connection) |
| Routes | `route/` | Declare endpoints and attach middleware (`auth`, `admin`, `multer`) |
| Middleware | `middleware/` | `auth.js`, `Admin.js`, `multer.js`, `error.js`, `catchAsyncErrors.js` |
| Controllers | `controllers/` | Request handling and business logic |
| Models | `models/` | Mongoose schemas (see [Database Schema](./DATABASE_SCHEMA.md)) |
| Utils | `utils/` | Helpers such as `jwtToken.js` (`sendToken`) and the error handler |

### Router mounts

All routers are mounted under `/api` in `server/index.js`:

| Prefix | Router |
|--------|--------|
| `/api/user` | `userRoute.js` |
| `/api/brand` | `brandRoutes.js` |
| `/api/bike-model` | `bikeModelRoutes.js` |
| `/api/parts` | `partRoutes.js` |
| `/api/cart` | `cartRoutes.js` |
| `/api/orders` | `orderRoutes.js` |
| `/api/payment-settings` | `paymentSettingsRoutes.js` |
| `/api/coupon` | `couponRoutes.js` |
| `/api/support` | `supportTicketRoutes.js` |
| `/api/address` | `addressRoutes.js` |

### Global middleware stack

Configured in `server/index.js`, in order:

1. **CORS** — `credentials: true`, origin allow-list built from `FRONTEND_URL`,
   `FRONTEND_WWW_URL`, and `http://localhost:5173`.
2. **cookie-parser** — parses cookies (the auth cookie is set on login).
3. **express.json** — parses JSON request bodies.

File uploads are handled per-route by **multer** (memory storage) and forwarded
to Cloudinary inside the controllers.

---

## Request lifecycle

A typical authenticated request flows like this:

```
Client (Axios)
   │  Authorization: Bearer <JWT>
   ▼
Express router  (/api/<resource>)
   │
   ▼
auth middleware ──► verifies JWT, loads req.user        (401 if missing/expired)
   │
   ▼
admin middleware (admin routes only) ──► checks role     (401 if not ADMIN/MANAGER)
   │
   ▼
multer (upload routes only) ──► parses multipart/form-data
   │
   ▼
Controller ──► validates input, talks to Mongoose models, calls Cloudinary/Brevo
   │
   ▼
JSON response  { success, ... }
```

Errors thrown in async controllers are funnelled through `catchAsyncErrors` and
the custom error handler, producing a consistent
`{ success: false, message }` JSON body.

---

## Authentication & authorization flow

Authentication is **stateless JWT**. The token payload is `{ id, role }`.

### Sign-up and email verification

```
POST /api/user/register   { name, email, password }
        │  creates the user (password bcrypt-hashed), generates an OTP,
        │  emails it via Brevo, stores login_otp + login_expiry
        ▼
POST /api/user/verify-email   { email, otp }
        │  validates the OTP and sets verifyEmail = true
        ▼
   (POST /api/user/resend-otp   { email }   — if the OTP expired)
```

### Login and token use

```
POST /api/user/login   { email, password }
        │  checks status === "Active", verifies password (bcrypt)
        │  sendToken(): signs JWT { id, role }, sets an httpOnly cookie,
        │  and returns { success, user, token, verifyEmail }
        ▼
Client stores `token` and sends it on protected calls:
        Authorization: Bearer <token>
        ▼
auth middleware verifies the token and loads req.user for the handler
```

### Roles

`role` is one of `USER`, `MANAGER`, `ADMIN` (see [User schema](./DATABASE_SCHEMA.md#user)).
The `admin` middleware authorizes a route only when the token's `role` is
`ADMIN` or `MANAGER`. Because the role lives in the JWT claim, a role change
takes effect on the user's **next login**.

### Password reset

```
PUT /api/user/forgot-password  { email }          → emails a reset OTP
PUT /api/user/verify-otp       { email, otp }      → verifies the OTP
PUT /api/user/reset-password   { email, newPassword, confirmPassword }
```

---

## Frontend architecture

The client (`client/src/`) is a Vite + React SPA:

- **State** — Redux Toolkit slices (`@reduxjs/toolkit`, `react-redux`).
- **Routing** — `react-router-dom`, with a `ProtectedRoute` guard
  (`client/src/extras/ProtectedRoute.jsx`).
- **HTTP** — Axios, configured to talk to `VITE_BACKEND_URL` and to send the
  JWT as a `Bearer` token.
- **Styling** — Tailwind CSS (`@tailwindcss/vite`).
- **UX** — `framer-motion` / `motion` for animation, `react-toastify` for
  notifications, `lucide-react` for icons, `jspdf` for client-side PDFs
  (e.g. receipts/invoices), `react-helmet-async` for document head/SEO.

---

## Technology stack

| Concern | Technology |
|---------|------------|
| Runtime | Node.js (ES modules — `"type": "module"`) |
| API framework | Express |
| Database | MongoDB + Mongoose |
| Auth | JSON Web Tokens (`jsonwebtoken`), `bcryptjs` for hashing |
| Uploads | `multer` (parsing) + Cloudinary (storage) |
| Email | Brevo via `sib-api-v3-sdk` |
| Frontend | React + Vite |
| Client state | Redux Toolkit |
| Styling | Tailwind CSS |

---

## Environment & configuration

The backend reads its configuration from environment variables (see
[Environment Variables](./ENVIRONMENT.md) for the full reference). Local
development setup, MongoDB Atlas / Cloudinary / Brevo setup, and the deployment
guide are documented in the root [`README.md`](../README.md).

> For the endpoint-by-endpoint contract see [API Reference](./API_REFERENCE.md);
> for collection shapes see [Database Schema](./DATABASE_SCHEMA.md); for
> admin/manager operations see [Admin Workflows](./ADMIN_WORKFLOWS.md).
