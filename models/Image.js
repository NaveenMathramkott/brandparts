import mongoose from "mongoose";

const ImageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  processedAt: { type: Date, default: Date.now },
  urls: { type: [], required: true },
});

export default mongoose.model("Image", ImageSchema);
