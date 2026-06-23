import mongoose from "mongoose";

// Single configuration document holding the store's manual-payment details
// (UPI ID + QR code) that the admin configures and customers see at checkout.
const paymentSettingsSchema = new mongoose.Schema(
  {
    upiId: { type: String, default: "" },
    qrImage: {
      public_id: { type: String, default: "" },
      url: { type: String, default: "" },
    },
    // When true, admins (role ADMIN / MANAGER) receive an email notification
    // every time a customer places a new order. Toggled from admin settings.
    notifyAdminsOnNewOrder: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("PaymentSettings", paymentSettingsSchema);
