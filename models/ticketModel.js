import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema({
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
    enum: ["pending", "paid", "cancelled"],
    default: "pending"
  },
  // --- UPDATED: Reference the new Payment model directly ---
  payment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Payment" // Changed paymentId to payment and ref to "Payment"
  },
  // --- END UPDATED ---
}, {
  timestamps: true,
});

export default mongoose.model("Ticket", ticketSchema);