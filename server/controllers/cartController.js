import Cart from "../models/cartModel.js";
import Part from "../models/partModel.js";
import catchAsyncErrors from "../middleware/catchAsyncErrors.js";
import ErrorHandler from "../utils/errorHandler.js";
import mongoose from "mongoose";

const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({
      user: userId,
      items: [],
      total: 0,
    });
  }
  return cart;
};

const addItemToCart = async (cart, partId, quantity) => {
  const part = await Part.findById(partId);
  if (!part) {
    throw new ErrorHandler("Part not found", 404);
  }
  if (part.stock < quantity) {
    throw new ErrorHandler("Insufficient stock", 400);
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.part.toString() === partId
  );
  if (itemIndex >= 0) {
    cart.items[itemIndex].quantity += quantity;
    cart.items[itemIndex].price = part.price * cart.items[itemIndex].quantity;
  } else {
    cart.items.push({
      part: partId,
      quantity,
      price: part.price * quantity,
      name: part.name,
    });
  }

  return cart;
};

export const addToCart = catchAsyncErrors(async (req, res, next) => {
  const { partId, quantity } = req.body;
  const userId = req.user._id;
  const cart = await getOrCreateCart(userId);

  await addItemToCart(cart, partId, quantity);
  cart.total = cart.items.reduce((sum, item) => sum + item.price, 0);
  await cart.save();

  res.status(200).json({ success: true, cart });
});

export const syncCart = catchAsyncErrors(async (req, res) => {
  const userId = req.user._id;
  const items = Array.isArray(req.body.items) ? req.body.items : [];
  const cart = await getOrCreateCart(userId);
  const failedItems = [];

  for (const item of items) {
    const partId = item.partId;
    const quantity = Number(item.quantity);

    if (!mongoose.Types.ObjectId.isValid(partId) || !Number.isInteger(quantity) || quantity < 1) {
      failedItems.push({
        partId,
        quantity: item.quantity,
        reason: "Invalid cart item",
      });
      continue;
    }

    try {
      await addItemToCart(cart, partId, quantity);
    } catch (error) {
      failedItems.push({
        partId,
        quantity,
        reason: error.message || "Unable to sync item",
      });
    }
  }

  cart.total = cart.items.reduce((sum, item) => sum + item.price, 0);
  await cart.save();

  const syncedCart = await Cart.findOne({ user: userId }).populate(
    "items.part",
    "name price images stock"
  );

  res.status(200).json({
    success: true,
    warnings: failedItems.map((item) => `Could not sync item ${item.partId}: ${item.reason}`),
    failedItems,
    cart: syncedCart,
  });
});

export const getCart = catchAsyncErrors(async (req, res, next) => {
  let cart = await Cart.findOne({ user: req.user._id }).populate(
    "items.part",
    "name price images stock"
  );
  if (!cart) {
    cart = await Cart.create({
      user: req.user._id,
      items: [],
      total: 0,
    });
    return res.status(200).json({ success: true, warnings: [], cart });
  }

  // 1. Filter out items where the underlying part was deleted
  cart.items = cart.items.filter(
    (item) => item.part !== null && item.part !== undefined
  );

  // 2. Validate and adjust quantities based on available stock, building warnings list
  const warnings = [];
  const adjustedItems = [];

  for (const item of cart.items) {
    const part = item.part;
    if (part.stock <= 0) {
      warnings.push(`${part.name} is out of stock and has been removed from your cart.`);
    } else {
      const storedUnitPrice = item.quantity > 0 ? item.price / item.quantity : part.price;
      const currentUnitPrice = part.price;
      
      let finalQuantity = item.quantity;
      if (part.stock < item.quantity) {
        warnings.push(`Quantity for ${part.name} has been adjusted to ${part.stock} due to limited stock.`);
        finalQuantity = part.stock;
      }
      
      if (Math.round(storedUnitPrice * 100) !== Math.round(currentUnitPrice * 100)) {
        warnings.push(`Price for ${part.name} has changed from ₹${storedUnitPrice.toLocaleString("en-IN")} to ₹${currentUnitPrice.toLocaleString("en-IN")}.`);
      }
      
      item.quantity = finalQuantity;
      item.price = currentUnitPrice * finalQuantity;
      adjustedItems.push(item);
    }
  }

  cart.items = adjustedItems;
  cart.total = cart.items.reduce((sum, item) => sum + item.price, 0);
  await cart.save();

  res.status(200).json({ success: true, warnings, cart });
});

export const updateCartItem = catchAsyncErrors(async (req, res, next) => {
  const { quantity } = req.body;
  const partId = req.params.partId;

  // Quantity must be a whole number of at least 1. Without this guard a direct
  // API call could send 0, a negative (which makes price negative), or a
  // fractional quantity. The client clamps too, but the endpoint must validate.
  if (!Number.isInteger(quantity) || quantity < 1) {
    return next(new ErrorHandler("Quantity must be a whole number of at least 1", 400));
  }

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return next(new ErrorHandler("Cart not found", 404));

  const itemIndex = cart.items.findIndex(
    (item) => item.part.toString() === partId
  );
  if (itemIndex < 0)
    return next(new ErrorHandler("Item not found in cart", 404));

  const part = await Part.findById(partId);
  if (!part) return next(new ErrorHandler("Product not found", 404));
  if (part.stock < quantity)
    return next(new ErrorHandler("Insufficient stock", 400));

  cart.items[itemIndex].quantity = quantity;
  cart.items[itemIndex].price = part.price * quantity;
  cart.total = cart.items.reduce((sum, item) => sum + item.price, 0);

  await cart.save();
  res.status(200).json({ success: true, cart });
});

export const removeFromCart = catchAsyncErrors(async (req, res, next) => {
  const { partId } = req.params;
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return next(new ErrorHandler("Cart not found", 404));

  cart.items = cart.items.filter((item) => item.part.toString() !== partId);
  cart.total = cart.items.reduce((sum, item) => sum + item.price, 0);

  await cart.save();
  res.status(200).json({ success: true, cart });
});


export const clearCart = catchAsyncErrors(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return next(new ErrorHandler("Cart not found", 404));

  console.log('Before clearing cart:', JSON.stringify(cart, null, 2));
  cart.items = [];
  cart.total = 0;

  await cart.save();
  const clearedCart = await Cart.findOne({ user: req.user._id }).populate("items.part", "name price images stock");
  console.log('Cleared cart:', JSON.stringify(clearedCart, null, 2));
  res.status(200).json({ success: true, cart: clearedCart });
});
