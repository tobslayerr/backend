import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema({
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

}, {
  timestamps: true,
});

export default mongoose.model("Ticket", ticketSchema);
