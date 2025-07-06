import mongoose from "mongoose";

const ImageSchema = new mongoose.Schema({
  originalName: { type: String, required: true },
  originalPath: { type: String, required: true },
  processedPath: { type: String, required: true },
  processedAt: { type: Date, default: Date.now },
  metadata: { type: Object },
});

export default mongoose.model("Image", ImageSchema);
