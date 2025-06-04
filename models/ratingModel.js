import mongoose from 'mongoose';

const ratingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
  stars: { type: Number, required: true },
  review: { type: String },
}, { timestamps: true });

ratingSchema.index({ user: 1, event: 1 }, { unique: true });

export default mongoose.model("Rating", ratingSchema);
