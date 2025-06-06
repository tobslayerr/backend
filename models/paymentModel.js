<<<<<<< HEAD
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
=======
import mongoose from 'mongoose';

// Nested schema to store details of each ticket type purchased within this payment
const paymentTicketDetailSchema = new mongoose.Schema({
  // This _id here is from the specific eventTicketType subdocument in Event.tickets
  ticketTypeId: { type: mongoose.Schema.Types.ObjectId, required: true },
  name: { type: String, required: true }, // Name of the ticket type (e.g., "VIP", "Early Bird")
  quantity: { type: Number, required: true, min: 1 }, // Quantity of this ticket type purchased
  price: { type: Number, required: true, min: 0 }, // Price per unit for this ticket type
  isFree: { type: Boolean, required: true, default: false } // Is this specific ticket type free?
});

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user', // Ensure 'user' matches your User model name
    required: true,
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event', // Ensure 'Event' matches your Event model name
    required: true,
  },
  order_id: { // Unique Order ID generated for Midtrans transaction
    type: String,
    required: true,
    unique: true,
  },
  gross_amount: { // Total amount of the transaction (before Midtrans fees)
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: 'IDR',
  },
  transaction_status: { // Status from Midtrans notification
    type: String,
    enum: ['pending', 'settlement', 'capture', 'deny', 'cancel', 'expire', 'refund'],
    default: 'pending',
  },
  transaction_time: { // Timestamp of the transaction from Midtrans
    type: Date,
  },
  payment_type: { // Payment method used (e.g., bank_transfer, credit_card)
    type: String,
  },
  va_number: { // Virtual Account number (if applicable)
    type: String,
  },
  bank: { // Bank name (if applicable)
    type: String,
  },
  fraud_status: { // Fraud detection status from Midtrans
    type: String,
  },
  transaction_token: { // Snap token used for the transaction
    type: String,
  },
  isPaid: { // Custom boolean flag for easy check if payment is settled
    type: Boolean,
    default: false,
  },
  // This array stores details of all ticket types included in this specific payment transaction
  tickets: [paymentTicketDetailSchema],
  raw_midtrans_response: { // Stores the full raw JSON notification from Midtrans for auditing/debugging
    type: Object,
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt timestamps
});

export default mongoose.model("Payment", paymentSchema);
>>>>>>> a86b8eb9da78aed4e980998d93a6e82ea1589e1a
