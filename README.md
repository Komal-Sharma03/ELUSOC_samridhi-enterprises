# 🚗 Samridhi Enterprises - Vehicle Spare Parts E-Commerce

**Samridhi Enterprises** is a professional full-stack MERN e-commerce platform designed for managing and selling vehicle spare parts. The project provides a seamless experience for buyers to find parts and for admins/sellers to manage inventory.

---

## 🚀 Features

### 👤 User Features
- **Authentication:** Secure login and registration using JWT.
- **Product Browsing:** Search and filter vehicle parts by brand and model.
- **Cart Management:** Add/remove items and manage quantities.
- **Reviews & Ratings:** Share feedback on purchased products.
- **Profile Management:** Update personal information and view order history.

### 🏪 Seller Features
- **Inventory Management:** Add and update stock levels for parts.
- **Product Listings:** Manage detailed listings including images and specifications.

### 🛡️ Admin Features
- **Dashboard:** Comprehensive overview of site activity and sales.
- **User Management:** Manage user roles and permissions.
- **Product Moderation:** Review and approve product listings.
- **Brand/Model Management:** Manage the database of vehicle brands and models.

---

## 🛠️ Tech Stack

- **Frontend:** React.js, Vite, Redux Toolkit, Tailwind CSS, Framer Motion, Axios.
- **Backend:** Node.js, Express.js.
- **Database:** MongoDB, Mongoose.
- **Cloud Services:** Cloudinary (Image Storage), Brevo (Email Service).
- **Deployment:** Vercel (Frontend/Backend).

---

## 📂 Folder Structure

```text
samridhi-enterprises/
├── client/              # Frontend React application
│   ├── public/          # Static assets
│   ├── src/             # Application source code
│   │   ├── api/         # Axios instance and API calls
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Page-level components
│   │   └── store/       # Redux state management
├── server/              # Backend Node.js application
│   ├── config/          # Database and service configurations
│   ├── controllers/     # API request handlers
│   ├── middleware/      # Custom Express middleware
│   ├── models/          # Mongoose schemas
│   ├── route/           # API route definitions
│   └── template/        # Email and document templates
```

---

## ⚙️ Installation

### Frontend Setup
1. Navigate to the `client` directory: `cd client`
2. Install dependencies: `npm install`
3. Create a `.env` file from `.env.example`.
4. Start the development server: `npm run dev`

### Backend Setup
1. Navigate to the `server` directory: `cd server`
2. Install dependencies: `npm install`
3. Create a `.env` file from `.env.example`.
4. Start the development server: `npm run dev`

---

## 🔐 Environment Variables

### Frontend (`client/.env`)
- `VITE_BACKEND_URL`: URL of the running backend server (e.g., `http://localhost:5000`).

### Backend (`server/.env`)
- `PORT`: Server port (e.g., `5000`).
- `MONGODB_URL`: MongoDB connection string.
- `FRONTEND_URL`: URL of the frontend application.
- `JWT_SECRET`: Secret key for JWT signing.
- `BREVO_API_KEY`: API key for Brevo email service.
- `CLOUDINARY_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: Cloudinary credentials.

---

## 🌐 Deployment Guide

### Frontend Deployment (Vercel)
1. Push your code to GitHub.
2. Connect your repository to Vercel.
3. Set the root directory to `client`.
4. Add environment variables in Vercel project settings.

### Backend Deployment (Vercel)
1. Push your code to GitHub.
2. Connect your repository to Vercel.
3. Set the root directory to `server`.
4. Configure `vercel.json` as provided in the repository.
5. Add environment variables in Vercel project settings.

### MongoDB Setup
1. Create a project on MongoDB Atlas.
2. Create a cluster and a database.
3. Get the connection string and add it to your backend `.env` as `MONGODB_URL`.

---

## 📸 Screenshots

*Placeholders for screenshots:*
- ![Home Page](https://via.placeholder.com/800x450?text=Home+Page+Screenshot)
- ![Product Page](https://via.placeholder.com/800x450?text=Product+Page+Screenshot)
- ![Admin Dashboard](https://via.placeholder.com/800x450?text=Admin+Dashboard+Screenshot)

---

## 🔮 Future Roadmap
- [ ] Integration of Razorpay/Stripe for payments.
- [ ] Advanced inventory tracking and compatibility matching.
- [ ] Real-time order tracking.
- [ ] Multi-language support.

---

## 🏆 ELUSOC 2026 Contribution Guide

**Target Branch:** `elusoc`

### Workflow
1. **Issue:** Find an open issue or create a new one.
2. **Assignment:** Get assigned to the issue by a Project Admin.
3. **Development:** Develop the feature/fix on a new branch.
4. **PR:** Submit a Pull Request targeting the `elusoc` branch.
5. **Review:** Address any review comments.
6. **Merge:** PR merged into `elusoc`.

### Rules
- Check existing issues before creating new ones.
- No duplicate issues.
- No PR without assignment.
- Resolve merge conflicts before submitting PRs.

---

## 🧑‍💻 Developer Info
**SRV30**
Full-Stack Developer
GitHub: [@SRV30](https://github.com/SRV30)
