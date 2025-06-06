import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  ticket: { type: mongoose.Schema.Types.ObjectId, ref: "Ticket", required: true },
  paymentType: { type: String }, 
  transactionId: { type: String, required: true }, 
  orderId: { type: String, required: true }, 
  transactionStatus: {
    type: String,
    enum: ["pending", "settlement", "cancel", "expire", "deny"],
    default: "pending"
  },
  grossAmount: { type: Number, required: true },
  paymentResponse: { type: Object },
}, {
  timestamps: true,
});

export default mongoose.model("Payment", paymentSchema);
