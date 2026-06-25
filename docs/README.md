# Samridhi Enterprises — Documentation

Technical documentation for the Samridhi Enterprises vehicle spare-parts
e-commerce platform. These documents describe the system as it is actually
implemented in `server/` and `client/`.

## Contents

| Document | What's inside |
|----------|---------------|
| [Architecture Overview](./ARCHITECTURE.md) | System design, backend layers, request lifecycle, authentication & authorization flow, tech stack |
| [API Reference](./API_REFERENCE.md) | Every REST endpoint across all 10 routers — method, path, access level, request fields |
| [Database Schema](./DATABASE_SCHEMA.md) | All 10 Mongoose models — fields, types, enums, relationships |
| [Admin Workflows](./ADMIN_WORKFLOWS.md) | Admin/manager operations: users, catalogue, orders & payment verification, coupons, support, analytics |
| [Workflow Guide](./WORKFLOWS.md) | In-depth breakdown of order processing, concurrency, atomic inventory reservation, stock restoration, payment verification, and status transition guards |
| [Environment Variables](./ENVIRONMENT.md) | Every backend/frontend env var and where it is used |

## Where other topics live

Setup and operational guides already live in the repository root and are **not**
duplicated here:

- **Project overview, features, tech stack, folder structure** → [`README.md`](../README.md)
- **Local development setup** (prerequisites, backend & frontend) → [`README.md`](../README.md)
- **MongoDB Atlas / Cloudinary / Brevo setup** → [`README.md`](../README.md)
- **Deployment guide** → [`README.md`](../README.md#-deployment-guide)
- **Contributor guidelines, branch strategy, commit & PR conventions** → [`CONTRIBUTING.md`](../CONTRIBUTING.md)
- **Code of conduct** → [`CODE_OF_CONDUCT.md`](../CODE_OF_CONDUCT.md)

## How to keep these docs accurate

These references are derived directly from the source. When a change touches the
API, models, env vars, or an admin capability, update the matching document in
the **same pull request** so the docs never drift from the code.
