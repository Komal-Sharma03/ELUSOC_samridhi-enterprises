import express from "express";
import {
  addToCart,
  getCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  syncCart,
} from "../controllers/cartController.js";
import auth from "../middleware/auth.js";

const cartRouter = express.Router();

cartRouter.route("/").post(auth, addToCart).get(auth, getCart);
cartRouter.route("/sync").post(auth, syncCart);
cartRouter.route("/clear").delete(auth, clearCart);
cartRouter
  .route("/:partId")
  .put(auth, updateCartItem)
  .delete(auth, removeFromCart);

export default cartRouter;
