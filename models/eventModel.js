import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  bannerUrl: { type: String, required: true },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true }, 
  ratings: [{ type: mongoose.Schema.Types.ObjectId, ref: "Rating"}],
  price: { type: Number, required: true, min: 0,},
  description : {type : String},
  ticketAvailable: { type: Number, required: true, min: 0, default: 0},
  type: { type: String, enum: ["online", "offline"], required: true },
  date: { type: Date, required: true },
  location: { type: String },
  latitude: { type: Number, required: true }, 
  longitude: { type: Number, required: true },
}, {
  timestamps: true,
});

const Event = mongoose.models.Event || mongoose.model("Event", eventSchema);

export default Event;
