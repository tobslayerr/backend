import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema({
<<<<<<< HEAD
  event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  quantity: { type: Number, required: true, min: 1 },
  eventDate: { type : String },
  price: { type: Number },
  total: { type: Number}, 
  status: { type: String,
    enum: ["pending", "paid", "cancelled", "Used"],
    default: "pending",
  },
  paymentId: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" },
  isScanned: { type: Boolean, default: false },
  verifiedByCreator: { type: Boolean, default: false}
=======
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user", // Changed 'User' to 'user' to match common convention in your other models
    required: true
  },
  // --- NEW: Reference the specific ticket type defined within the Event model ---
  eventTicketType: {
    type: mongoose.Schema.Types.ObjectId,
    required: true // This will store the _id of the subdocument from event.tickets
  },
  // --- END NEW ---
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  eventDate: {
    type: Date // Changed from String to Date for better date handling
  },
  price: {
    type: Number,
    required: true,
    min: 0
  }, // Price per unit of this specific ticket type purchased
  total: {
    type: Number,
    required: true
  }, // Total price for this line item (price * quantity)
  status: {
    type: String,
    enum: ["pending", "paid", "cancelled", "Used"],
    default: "pending"
  },
  // --- UPDATED: Reference the new Payment model directly ---
  payment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Payment" // Changed paymentId to payment and ref to "Payment"
  },
  // --- END UPDATED ---
>>>>>>> a86b8eb9da78aed4e980998d93a6e82ea1589e1a
}, {
  timestamps: true,
});

export default mongoose.model("Ticket", ticketSchema);
<<<<<<< HEAD

=======
>>>>>>> a86b8eb9da78aed4e980998d93a6e82ea1589e1a
