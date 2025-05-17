import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  stars: { type: Number, required: true, min: 1, max: 5 },
  review: { type: String, default: "" }
});

const eventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  bannerUrl: { type: String, required: true },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true }, 
  ratings: [ratingSchema],
  type: { type: String, enum: ["online", "offline"], required: true },
  price: { type: Number, default: 0 },
  isFree: { type: Boolean, default: false },
  date: { type: Date, required: true },
  location: { type: String },
}, {
  timestamps: true,
});

const Event = mongoose.models.Event || mongoose.model("Event", eventSchema);

export default Event;
