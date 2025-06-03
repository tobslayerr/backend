import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  stars: { type: Number, required: true, min: 1, max: 5 },
  review: { type: String, default: "" }
});

// --- NEW: Define a schema for ticket types within an event ---
const eventTicketTypeSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., "Early Bird", "Regular", "VIP"
  quantity: { type: Number, required: true, min: 0 }, // Total available tickets of this type
  price: { type: Number, default: 0, min: 0 }, // Price for this specific ticket type
  isFree: { type: Boolean, default: false }, // Is this specific ticket type free?
});
// --- END NEW ---

const eventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  bannerUrl: { type: String, required: true },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  ratings: [ratingSchema],
  type: { type: String, enum: ["online", "offline"], required: true },
  date: { type: Date, required: true },
  location: { type: String },
  description: { type: String, required: true },
  // Removed isFree and price from the main event schema
  // as pricing will now be handled by individual ticket types.
  // If an event has only free tickets, then it's a "free event".
  // If an event has any paid tickets, it's considered a "paid event".

  // --- NEW: Add an array of ticket types to the event schema ---
  tickets: [eventTicketTypeSchema], // This will store different categories/types of tickets for the event
  // --- END NEW ---
}, {
  timestamps: true,
});

const Event = mongoose.models.Event || mongoose.model("Event", eventSchema);

export default Event;
