import Order from "../models/orderModel.js";
import Cart from "../models/cartModel.js";
import User from "../models/userModel.js";
import Part from "../models/partModel.js";
import catchAsyncErrors from "../middleware/catchAsyncErrors.js";
import { uploadImage } from "../utils/cloudinary.js";
import sendEmail from "../config/sendEmail.js";
import orderReceiptHtml from "../template/orderReceiptTemplate.js";

const REQUIRED_ADDRESS_FIELDS = [
  "fullName",
  "phone",
  "addressLine",
  "city",
  "pincode",
];

// POST /api/orders/new  (auth, multipart: optional "paymentScreenshot")
// Creates an order from the logged-in user's cart. COD orders are confirmed
// immediately; Online orders require a payment screenshot and enter the
// "Pending Verification" state until an admin approves them.
export const createOrder = catchAsyncErrors(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate(
    "items.part",
    "name price images stock"
  );

  if (!cart || cart.items.length === 0) {
    return res
      .status(400)
      .json({ success: false, message: "Your cart is empty" });
  }

  const { fullName, phone, addressLine, city, state, pincode, upiReference } =
    req.body;
  const paymentMethod = req.body.paymentMethod;

  const shippingAddress = { fullName, phone, addressLine, city, state, pincode };
  const missing = REQUIRED_ADDRESS_FIELDS.filter(
    (field) => !shippingAddress[field] || !String(shippingAddress[field]).trim()
  );
  if (missing.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Missing required address fields: ${missing.join(", ")}`,
    });
  }

  if (!["COD", "Online"].includes(paymentMethod)) {
    return res.status(400).json({
      success: false,
      message: "Payment method must be either COD or Online",
    });
  }

  // Re-validate and deduct stock to prevent overselling
  for (const item of cart.items) {
    if (!item.part) {
      return res.status(400).json({
        success: false,
        message: "A product in your cart is no longer available",
      });
    }
    const part = await Part.findById(item.part._id);
    if (!part) {
      return res.status(400).json({
        success: false,
        message: `Product ${item.name || "Item"} is no longer available`,
      });
    }
    if (part.stock < item.quantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock for ${part.name}`,
      });
    }
  }

  // All checks passed, deduct stock atomically
  for (const item of cart.items) {
    await Part.findByIdAndUpdate(item.part._id, { $inc: { stock: -item.quantity } });
  }

  // Snapshot the cart items onto the order (unit price + image), so the order
  // record stays correct even if a part is later edited or removed.
  const items = cart.items.map((item) => {
    const unitPrice =
      item.part && typeof item.part.price === "number"
        ? item.part.price
        : item.quantity > 0
        ? item.price / item.quantity
        : item.price;
    const image =
      item.part && item.part.images && item.part.images.length > 0
        ? item.part.images[0].url
        : "";
    return {
      part: item.part ? item.part._id : undefined,
      name: item.name || (item.part ? item.part.name : "Item"),
      price: unitPrice,
      quantity: item.quantity,
      image,
    };
  });

  // Derive the total from the snapshot itself so the receipt's line totals
  // always sum to the grand total, regardless of any stale cart.total value.
  const itemsTotal = items.reduce(
    (sum, it) => sum + it.price * it.quantity,
    0
  );

  let paymentScreenshot = { public_id: "", url: "" };
  let paymentStatus;
  let orderStatus;

  if (paymentMethod === "Online") {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "A payment screenshot is required for online payments",
      });
    }
    const uploaded = await uploadImage(req.file);
    if (!uploaded || !uploaded.secure_url) {
      return res.status(500).json({
        success: false,
        message: "Payment screenshot upload failed. Please try again.",
      });
    }
    paymentScreenshot = {
      public_id: uploaded.public_id,
      url: uploaded.secure_url,
    };
    paymentStatus = "Pending Verification";
    orderStatus = "Pending Verification";
  } else {
    // COD
    paymentStatus = "Pending";
    orderStatus = "Confirmed";
  }

  const order = await Order.create({
    user: req.user._id,
    items,
    shippingAddress,
    itemsTotal,
    paymentMethod,
    paymentStatus,
    orderStatus,
    paymentScreenshot,
    upiReference: upiReference || "",
  });

  // Link the order to the user's history WITHOUT calling user.save(), which
  // would trigger the model's pre-save hook and re-hash the password.
  await User.findByIdAndUpdate(req.user._id, {
    $push: { orderHistory: order._id },
  });

  // Clear the cart now that it has been converted into an order.
  cart.items = [];
  cart.total = 0;
  await cart.save();

  // Fire-and-forget email; a failure here must never break order creation.
  try {
    if (paymentMethod === "COD") {
      await sendEmail({
        sendTo: req.user.email,
        subject: `Order Confirmed - ${order._id}`,
        html: orderReceiptHtml(order, req.user),
      });
    } else {
      await sendEmail({
        sendTo: req.user.email,
        subject: `Order Received - Pending Payment Verification`,
        html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
          <h2 style="color:#111827;">Thank you for your order!</h2>
          <p style="color:#555;">We have received your order <strong>${order._id}</strong> and your payment screenshot.</p>
          <p style="color:#555;">Our team will verify your payment shortly. You will receive a confirmation email with your receipt once it is approved.</p>
          <p style="color:#555;">Order total: <strong>Rs. ${Number(
            itemsTotal
          ).toLocaleString("en-IN")}</strong></p>
        </div>`,
      });
    }
  } catch (mailErr) {
    console.error("Order email failed:", mailErr.message);
  }

  res.status(201).json({
    success: true,
    message:
      paymentMethod === "COD"
        ? "Order placed successfully"
        : "Order placed. Payment is pending verification.",
    order,
  });
});

// GET /api/orders/my-orders  (auth)
export const getMyOrders = catchAsyncErrors(async (req, res, next) => {
  const orders = await Order.find({ user: req.user._id }).sort({
    createdAt: -1,
  });
  res.status(200).json({ success: true, count: orders.length, orders });
});

// GET /api/orders/:id  (auth, owner only)
export const getOrderById = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, message: "Order not found" });
  }
  if (order.user.toString() !== req.user._id.toString()) {
    return res
      .status(403)
      .json({ success: false, message: "Not authorized to view this order" });
  }
  res.status(200).json({ success: true, order });
});

// GET /api/orders/admin/all?status=...  (auth, admin)
export const adminGetAllOrders = catchAsyncErrors(async (req, res, next) => {
  const filter = {};
  if (req.query.status) {
    filter.orderStatus = req.query.status;
  }
  const orders = await Order.find(filter)
    .populate("user", "name email")
    .sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: orders.length, orders });
});

// PUT /api/orders/admin/verify/:id  (auth, admin)  body: { action, rejectionReason }
export const adminVerifyPayment = catchAsyncErrors(async (req, res, next) => {
  const { action, rejectionReason } = req.body;

  if (!["approve", "reject"].includes(action)) {
    return res.status(400).json({
      success: false,
      message: "Action must be either 'approve' or 'reject'",
    });
  }

  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email"
  );
  if (!order) {
    return res.status(404).json({ success: false, message: "Order not found" });
  }

  if (action === "approve") {
    order.paymentStatus = "Success";
    order.orderStatus = "Confirmed";
    order.verifiedAt = new Date();
    order.rejectionReason = "";
    await order.save();

    try {
      await sendEmail({
        sendTo: order.user?.email,
        subject: `Payment Verified - Receipt for Order ${order._id}`,
        html: orderReceiptHtml(order, order.user),
      });
    } catch (mailErr) {
      console.error("Receipt email failed:", mailErr.message);
    }

    return res.status(200).json({
      success: true,
      message: "Payment approved and order confirmed",
      order,
    });
  }

  // reject
  order.paymentStatus = "Failed";
  order.orderStatus = "Cancelled";
  order.rejectionReason = rejectionReason || "Payment could not be verified";
  await order.save();

  // Restore stock
  for (const item of order.items) {
    if (item.part) {
      await Part.findByIdAndUpdate(item.part, { $inc: { stock: item.quantity } });
    }
  }

  try {
    await sendEmail({
      sendTo: order.user?.email,
      subject: `Payment Verification Failed - Order ${order._id}`,
      html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
        <h2 style="color:#b91c1c;">Payment Verification Failed</h2>
        <p style="color:#555;">Unfortunately we could not verify the payment for your order <strong>${order._id}</strong>.</p>
        <p style="color:#555;"><strong>Reason:</strong> ${order.rejectionReason}</p>
        <p style="color:#555;">If you believe this is a mistake, please contact our support team.</p>
      </div>`,
    });
  } catch (mailErr) {
    console.error("Rejection email failed:", mailErr.message);
  }

  res.status(200).json({
    success: true,
    message: "Payment rejected and order cancelled",
    order,
  });
});


// PUT /api/orders/admin/status/:id  (auth, admin)  body: { orderStatus }
// Advances an order through its fulfilment lifecycle (Confirmed -> Processing
// -> Shipped -> Delivered, or Cancelled). Payment verification is handled
// separately by adminVerifyPayment; this endpoint is purely operational and
// only accepts the post-confirmation statuses so a pending-verification order
// cannot be pushed straight to Shipped without its payment being approved.
const FULFILLMENT_STATUSES = [
  "Confirmed",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

export const adminUpdateOrderStatus = catchAsyncErrors(
  async (req, res, next) => {
    const { orderStatus } = req.body;

    if (!FULFILLMENT_STATUSES.includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `orderStatus must be one of: ${FULFILLMENT_STATUSES.join(", ")}`,
      });
    }

    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email"
    );
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    // Guard: an order whose payment has not succeeded should not be marked as
    // physically fulfilled. It can still be Cancelled.
    if (
      order.paymentStatus !== "Success" &&
      ["Processing", "Shipped", "Delivered"].includes(orderStatus)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot advance fulfilment until the order's payment is verified",
      });
    }

    const previousStatus = order.orderStatus;
    order.orderStatus = orderStatus;
    await order.save();

    if (previousStatus !== "Cancelled" && orderStatus === "Cancelled") {
      // Restore stock
      for (const item of order.items) {
        if (item.part) {
          await Part.findByIdAndUpdate(item.part, { $inc: { stock: item.quantity } });
        }
      }
    }

    res.status(200).json({
      success: true,
      message: `Order status updated to ${orderStatus}`,
      order,
    });
  }
);
