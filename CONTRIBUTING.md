# Contributing to Samridhi Enterprises

Thank you for your interest in contributing to Samridhi Enterprises! We welcome contributions from everyone.

This project is part of **ELUSOC 2026**. Please follow the guidelines below to ensure a smooth contribution process.

## 📌 Project Overview
Samridhi Enterprises is a MERN stack e-commerce platform for vehicle spare parts. It features user authentication, product management, cart functionality, and an admin dashboard.

## 🛠️ Local Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (Local or Atlas)
- Git

### Steps
1. **Clone the repository:**
   ```bash
   git clone https://github.com/SRV30/samridhi-enterprises.git
   cd samridhi-enterprises
   ```

2. **Setup Backend:**
   ```bash
   cd server
   npm install
   cp .env.example .env
   # Update .env with your MongoDB URL and other credentials
   npm run dev
   ```

3. **Setup Frontend:**
   ```bash
   cd ../client
   npm install
   cp .env.example .env
   # Update .env with VITE_BACKEND_URL (usually http://localhost:5000)
   npm run dev
   ```

## 🌿 Branch Strategy
- **Main Branch:** `main` (Production-ready code)
- **ELUSOC Branch:** `elusoc` (Target branch for ELUSOC 2026 contributions)
- **Feature Branches:** `feature/your-feature-name` or `bugfix/issue-id`

**Important:** All ELUSOC contributions should target the `elusoc` branch.

## 💻 Coding Standards
- Use functional components with Hooks in React.
- Follow ESLint configurations provided in the `client` directory.
- Use meaningful variable and function names.
- Keep components small and reusable.
- Ensure proper error handling in both frontend and backend.

## 💬 Commit Message Conventions
We follow a simple convention for commit messages:
- `feat: ...` for new features
- `fix: ...` for bug fixes
- `docs: ...` for documentation changes
- `style: ...` for formatting, missing semi colons, etc.
- `refactor: ...` for code changes that neither fix a bug nor add a feature

Example: `feat: add search functionality to product page`

## 🚀 Pull Request Workflow
1. Fork the repository.
2. Create a new branch from `elusoc`.
3. Make your changes and commit them.
4. Push your changes to your fork.
5. Submit a Pull Request to the `elusoc` branch of the original repository.
6. Link the PR to the relevant issue.

## 🏆 ELUSOC Contribution Workflow
1. Browse existing issues or create a new one.
2. Wait for the issue to be assigned to you by a Project Admin.
3. Start working on the issue only after assignment.
4. Submit your PR before the deadline.
5. Address any feedback provided during the review.

## 🎫 Issue Assignment Process
- Comment on an open issue expressing your interest in working on it.
- Project Admins will assign the issue to you based on your expertise and current workload.
- Do not start working on an issue unless it is officially assigned to you.
- Avoid duplicate issues; check existing ones before creating new ones.

---
Happy Contributing! 🚗
