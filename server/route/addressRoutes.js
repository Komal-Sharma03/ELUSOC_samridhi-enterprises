import express from "express";
import {
  getMyAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "../controllers/addressController.js";
import auth from "../middleware/auth.js";

const addressRouter = express.Router();

// All address routes are scoped to the logged-in user.
addressRouter.get("/my", auth, getMyAddresses);
addressRouter.post("/add", auth, addAddress);
addressRouter.put("/update/:id", auth, updateAddress);
addressRouter.delete("/delete/:id", auth, deleteAddress);
addressRouter.put("/default/:id", auth, setDefaultAddress);

export default addressRouter;
