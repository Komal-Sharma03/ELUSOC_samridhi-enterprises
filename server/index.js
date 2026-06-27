import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import cloudinary from "cloudinary";
import connectDB from "./config/connectDB.js";
import errorMiddleware from "./middleware/error.js";
import requestLogger from "./middleware/requestLogger.js";
import validateEnv from "./utils/validateEnv.js";

dotenv.config();
validateEnv();

process.on("uncaughtException", (err) => {
  console.error(`Error: ${err.message}`);
  console.error(`Shutting down the server due to Uncaught Exception`);
  process.exit(1);
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(requestLogger);

app.get("/", (req, res) => {
  res.send("Server is running: " + PORT);
});

//routes
import userRouter from "./route/userRoute.js";
import brandRouter from "./route/brandRoutes.js";
import bikeModelRouter from "./route/bikeModelRoutes.js";
import partRouter from "./route/partRoutes.js";
import cartRouter from "./route/cartRoutes.js";
import wishlistRouter from "./route/wishlistRoutes.js";
import orderRouter from "./route/orderRoutes.js";
import paymentSettingsRouter from "./route/paymentSettingsRoutes.js";
import couponRouter from "./route/couponRoutes.js";
import supportTicketRouter from "./route/supportTicketRoutes.js";
import addressRouter from "./route/addressRoutes.js";

app.use("/api/user", userRouter);
app.use("/api/brand", brandRouter);
app.use("/api/bike-model", bikeModelRouter);
app.use("/api/parts", partRouter)
app.use("/api/cart", cartRouter)
app.use("/api/wishlist", wishlistRouter)
app.use("/api/orders", orderRouter)
app.use("/api/payment-settings", paymentSettingsRouter)
app.use("/api/coupon", couponRouter)
app.use("/api/support", supportTicketRouter)
app.use("/api/address", addressRouter)

// Error middleware should be registered AFTER routes so it can catch downstream errors.
app.use(errorMiddleware);

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
});

process.on("unhandledRejection", (err) => {
  console.error(`Error: ${err.message}`);
  console.error(`Shutting down the server due to Unhandled Promise Rejection`);

  if (app && typeof app.close === "function") {
    app.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

