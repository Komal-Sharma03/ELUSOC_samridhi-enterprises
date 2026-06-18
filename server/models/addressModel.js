import mongoose from "mongoose";

// A saved delivery address belonging to a user. Field names mirror the order's
// shippingAddress shape (fullName, phone, addressLine, city, state, pincode) so
// a saved address can populate the checkout form directly. Registered under the
// model name "address" to match the existing `addressDetails` ref in userModel.
const addressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // An optional friendly label for the address, e.g. "Home" or "Office".
    label: {
      type: String,
      default: "",
      trim: true,
      maxlength: [40, "Label cannot exceed 40 characters"],
    },
    fullName: {
      type: String,
      required: [true, "Please enter the recipient's full name"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Please enter a phone number"],
      trim: true,
    },
    addressLine: {
      type: String,
      required: [true, "Please enter the address"],
      trim: true,
    },
    city: {
      type: String,
      required: [true, "Please enter the city"],
      trim: true,
    },
    state: {
      type: String,
      default: "",
      trim: true,
    },
    pincode: {
      type: String,
      required: [true, "Please enter the pincode"],
      trim: true,
    },
    // Exactly one address per user should be the default; the controller keeps
    // this invariant by clearing the flag on the user's other addresses.
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

addressSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model("address", addressSchema);
