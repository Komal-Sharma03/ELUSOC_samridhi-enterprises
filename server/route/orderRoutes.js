import express from "express";
import auth from "../middleware/auth.js";
import admin from "../middleware/Admin.js";
import upload from "../middleware/multer.js";
import {
  createOrder,
  getMyOrders,
  getOrderById,
  adminGetAllOrders,
  adminVerifyPayment,
  adminUpdateOrderStatus,
} from "../controllers/orderController.js";
import {
  adminGetDashboardAnalytics,
  adminGetInventoryOverview,
} from "../controllers/analyticsController.js";

const orderRouter = express.Router();

// Customer
orderRouter.post("/new", auth, upload.single("paymentScreenshot"), createOrder);
orderRouter.get("/my-orders", auth, getMyOrders);

// Admin
orderRouter.get("/admin/all", auth, admin, adminGetAllOrders);
orderRouter.put("/admin/verify/:id", auth, admin, adminVerifyPayment);
orderRouter.put("/admin/status/:id", auth, admin, adminUpdateOrderStatus);

// Admin — dashboard analytics & inventory (real data, no hardcoded values)
orderRouter.get("/admin/analytics", auth, admin, adminGetDashboardAnalytics);
orderRouter.get("/admin/inventory", auth, admin, adminGetInventoryOverview);

// Keep the dynamic /:id route LAST so it does not shadow the specific routes
// above (e.g. /my-orders, /admin/all).
orderRouter.get("/:id", auth, getOrderById);

export default orderRouter;
