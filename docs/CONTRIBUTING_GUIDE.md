# Contributor Workflow Guide

Welcome to the Samridhi Enterprises developer guide! This document outlines step-by-step instructions on setting up, developing, testing, and submitting your contributions to this repository.

---

## Directory Overview

The project is structured as a monorepo split into two primary folders:
- **`client/`**: React Vite application styled with Tailwind CSS. State is managed via Redux Toolkit.
- **`server/`**: Node.js Express server using Mongoose and MongoDB.

---

## Branching and Git Flow

To keep the repository clean and ensure easy reviews:
1. **Always Sync**: Before creating a branch, switch to `main`, pull the latest remote main:
   ```bash
   git checkout main
   git pull origin main
   ```
2. **Dedicated Branching**: Create a separate branch for every feature or fix:
   ```bash
   git checkout -b <type>/<description>
   # Examples: feat/inactivity-tracker, fix/cart-sync, docs/arch-guide
   ```
3. **Commit Messages**: Follow standard semantic prefixes (e.g. `feat: ...`, `fix: ...`, `docs: ...`, `ci: ...`).

---

## Verification Checklist

Before pushing your changes and opening a pull request, run the following verification steps:

### 1. Frontend Build Verification
Make sure the client compiles without any bundling errors:
```bash
cd client
npm run build
```

### 2. Frontend Lint Check
Run the ESLint suite to check for styling and runtime recommendations:
```bash
cd client
npm run lint
```

### 3. Backend Setup Verification
Ensure all backend packages resolve cleanly:
```bash
cd server
npm install
```

---

## Pull Request Guidelines

- target pull requests to the `main` branch.
- Ensure that the automated **Pull Request Verification** GitHub Action runs and passes successfully.
- Provide a clear, detailed PR description outlining the key changes, added files, and manual testing steps.
