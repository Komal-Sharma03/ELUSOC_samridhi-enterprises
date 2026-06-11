import Part from "../models/partModel.js";
import BikeModel from "../models/bikeModel.js";
import catchAsyncErrors from "../middleware/catchAsyncErrors.js";
import ErrorHandler from "../utils/errorHandler.js";
import { uploadImage, deleteImage } from "../utils/cloudinary.js";

// Create a new part
export const addPart = catchAsyncErrors(async (req, res, next) => {
  const { product_id, name, description, price, stock, vehicleCompatibility, category, bestseller } = req.body;

  if (!req.files || req.files.length === 0) {
    return next(new ErrorHandler("At least one image is required", 400));
  }

  const images = [];
  for (const file of req.files) {
    const upload = await uploadImage(file);
    if (!upload?.secure_url) {
      return next(new ErrorHandler("Image upload failed", 500));
    }
    images.push({ public_id: upload.public_id, url: upload.secure_url });
  }

  const part = await Part.create({
    product_id,
    name,
    description,
    price,
    stock,
    category,
    vehicleCompatibility: vehicleCompatibility || [],
    images,
    bestseller: bestseller === "true" || bestseller === true,
  });

  res.status(201).json({ success: true, part });
});

// Get all parts
export const getAllParts = catchAsyncErrors(async (req, res) => {
  const parts = await Part.find().populate("vehicleCompatibility", "name");
  res.status(200).json({ success: true, count: parts.length, parts });
});

// Get single part
export const getPartById = catchAsyncErrors(async (req, res, next) => {
  const part = await Part.findById(req.params.id).populate("vehicleCompatibility", "name");
  if (!part) return next(new ErrorHandler("Part not found", 404));
  res.status(200).json({ success: true, part });
});

// Update part
export const updatePart = catchAsyncErrors(async (req, res, next) => {
  const part = await Part.findById(req.params.id);
  if (!part) return next(new ErrorHandler("Part not found", 404));

  const fieldsToUpdate = ["product_id", "name", "description", "price", "stock", "category", "vehicleCompatibility", "bestseller"];
  fieldsToUpdate.forEach((field) => {
    if (req.body[field] !== undefined) {
      part[field] = field === "bestseller" ? req.body[field] === "true" || req.body[field] === true : req.body[field];
    }
  });

  if (req.files && req.files.length > 0) {
    // Delete existing images
    for (const img of part.images) {
      await deleteImage(img.public_id);
    }

    // Upload new images
    const images = [];
    for (const file of req.files) {
      const upload = await uploadImage(file);
      if (!upload?.secure_url) {
        return next(new ErrorHandler("Image upload failed", 500));
      }
      images.push({ public_id: upload.public_id, url: upload.secure_url });
    }
    part.images = images;
  }

  await part.save();
  res.status(200).json({ success: true, message: "Part updated", part });
});

// Delete part
export const deletePart = catchAsyncErrors(async (req, res, next) => {
  const part = await Part.findById(req.params.id);
  if (!part) return next(new ErrorHandler("Part not found", 404));

  for (const img of part.images) {
    await deleteImage(img.public_id);
  }

  await part.deleteOne();
  res.status(200).json({ success: true, message: "Part deleted" });
});

// Add or update review
export const createOrUpdateReview = catchAsyncErrors(async (req, res, next) => {
  const { rating, comment } = req.body;
  const part = await Part.findById(req.params.id);
  if (!part) return next(new ErrorHandler("Part not found", 404));

  const existingReviewIndex = part.reviews.findIndex(
    (r) => r.user.toString() === req.user._id.toString()
  );

  if (existingReviewIndex !== -1) {
    part.reviews[existingReviewIndex].comment = comment;
    part.reviews[existingReviewIndex].rating = Number(rating);
  } else {
    part.reviews.push({ user: req.user._id, name: req.user.name, rating: Number(rating), comment });
  }

  part.numOfReviews = part.reviews.length;
  part.ratings = part.reviews.length
    ? part.reviews.reduce((sum, r) => sum + r.rating, 0) / part.reviews.length
    : 0;

  await part.save();
  res.status(200).json({ success: true, message: "Review submitted" });
});

// Get similar / recommended parts for a given part.
// Recommends other products based on: same category, shared vehicle
// compatibility (i.e. fits the same bikes/brands), and a similar price range.
// The current product is always excluded and results are capped (default 6).
export const getSimilarParts = catchAsyncErrors(async (req, res, next) => {
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 6, 1), 20);

  const current = await Part.findById(req.params.id);
  if (!current) return next(new ErrorHandler("Part not found", 404));

  const compatibilityIds = (current.vehicleCompatibility || []).map((v) =>
    v.toString()
  );

  // Candidate pool: other parts that share the category OR at least one
  // compatible vehicle. This keeps the query scoped instead of scanning the
  // whole catalogue, while still covering both signals used for scoring.
  const orConditions = [{ category: current.category }];
  if (compatibilityIds.length > 0) {
    orConditions.push({
      vehicleCompatibility: { $in: current.vehicleCompatibility },
    });
  }

  const candidates = await Part.find({
    _id: { $ne: current._id },
    $or: orConditions,
  })
    .populate("vehicleCompatibility", "name")
    .select(
      "product_id name price stock category images ratings numOfReviews bestseller vehicleCompatibility"
    );

  // Score each candidate by how closely it matches the current product.
  const price = current.price || 0;
  const scored = candidates.map((part) => {
    let score = 0;

    // Same category is the strongest signal.
    if (part.category === current.category) score += 3;

    // Shared compatible vehicles (same fitment / brand). Capped so a part that
    // fits many vehicles can't dominate purely on overlap count.
    if (compatibilityIds.length > 0) {
      const shared = (part.vehicleCompatibility || []).filter((v) =>
        compatibilityIds.includes(v._id.toString())
      ).length;
      score += Math.min(shared, 3) * 2;
    }

    // Similar price range relative to the current product.
    if (price > 0) {
      const diff = Math.abs(part.price - price) / price;
      if (diff <= 0.2) score += 2;
      else if (diff <= 0.4) score += 1;
    }

    return { part, score };
  });

  // Highest score first; break ties by rating, then by review count.
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if ((b.part.ratings || 0) !== (a.part.ratings || 0))
      return (b.part.ratings || 0) - (a.part.ratings || 0);
    return (b.part.numOfReviews || 0) - (a.part.numOfReviews || 0);
  });

  const parts = scored.slice(0, limit).map((s) => s.part);

  res.status(200).json({ success: true, count: parts.length, parts });
});

// Delete review
export const deleteReview = catchAsyncErrors(async (req, res, next) => {
  const part = await Part.findById(req.params.id);
  if (!part) return next(new ErrorHandler("Part not found", 404));

  part.reviews = part.reviews.filter((r) => r.user.toString() !== req.user._id.toString());
  part.numOfReviews = part.reviews.length;
  part.ratings = part.reviews.length
    ? part.reviews.reduce((sum, r) => sum + r.rating, 0) / part.reviews.length
    : 0;

  await part.save();
  res.status(200).json({ success: true, message: "Review removed" });
});