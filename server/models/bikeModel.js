import mongoose from "mongoose";

const bikeModelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  brand: { type: mongoose.Schema.Types.ObjectId, ref: "Brand", required: true },

  // Manufacturing-year range this model was produced / is compatible with.
  // Both are optional: when left empty the model is treated as compatible with
  // ANY year (universal), so models created before this field existed keep
  // matching year-based searches instead of disappearing.
  yearStart: { type: Number, min: 1900, default: null },
  yearEnd: { type: Number, min: 1900, default: null },

  // Engine type / variant (e.g. "150cc", "Petrol", "EFI"). Optional: an empty
  // value means the model matches any engine type.
  engineType: { type: String, trim: true, default: "" },

  images: [
    {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
  ],
});

// Indexes to keep vehicle-compatibility lookups efficient as the catalogue
// grows: brand + model name for brand/model filtering, and the manufacturing
// year range for year filtering.
bikeModelSchema.index({ brand: 1, name: 1 });
bikeModelSchema.index({ yearStart: 1, yearEnd: 1 });

export default mongoose.model("BikeModel", bikeModelSchema);
