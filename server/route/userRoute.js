import express from "express";
import {
  deleteUser,
  forgotPassword,
  getAllUsers,
  getSingleUser,
  getUserDetails,
  loginUser,
  logoutUser,
  registerUser,
  resendOtp,
  resetPassword,
  updatePassword,
  updateUserDetails,
  updateUserRole,
  updateUserStatus,
  uploadAvatar,
  verifyEmailOtp,
  verifyOtp,
} from "../controllers/userController.js";
import auth from "../middleware/auth.js";
import upload from "../middleware/multer.js";
import admin from "../middleware/Admin.js";
import { createAuthOtpLimiter } from "../middleware/rateLimiter.js";

const userRouter = express.Router();

// Auth/OTP brute-force protection: stricter fixed-window limits per IP and (optionally) per email.
const authOtpIpLimit = createAuthOtpLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxByIp: 10,
  maxByEmail: 5,
  enableEmail: true,
  logInDev: true,
  message: "Too many requests. Please try again later.",
});

userRouter.post("/register", registerUser);


userRouter.post("/verify-email", verifyEmailOtp);

userRouter.post("/resend-otp", authOtpIpLimit, resendOtp);

userRouter.post("/login", authOtpIpLimit, loginUser);


userRouter.get("/logout", logoutUser);

userRouter.put("/upload-avatar", upload.single("avatar"), auth, uploadAvatar);

userRouter.put("/update/password", auth, updatePassword);

userRouter.put("/forgot-password", authOtpIpLimit, forgotPassword);

userRouter.put("/verify-otp", authOtpIpLimit, verifyOtp);


userRouter.put("/reset-password", resetPassword);

userRouter.get("/me", auth, getUserDetails);

userRouter.put(
  "/update-user",
  auth,
  upload.single("avatar"),
  updateUserDetails
);

userRouter.get("/admin/get", auth, admin, getAllUsers);

userRouter.get("/admin/get/:id", auth, admin, getSingleUser);

userRouter.put("/admin/update", auth, admin, updateUserRole);

userRouter.delete("/admin/delete/:id", auth, admin, deleteUser);

userRouter.patch("/admin/:id/status", auth, admin, updateUserStatus);

export default userRouter;
