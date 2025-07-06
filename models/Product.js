import mongoose from "mongoose";

const productSchema = mongoose.Schema(
  {
    sku: {
      type: String,
      required: true,
      unique: true,
    },
    // images: [String],
    // attributes: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
