import {snap, coreApi}from '../config/midtrans.js'
import Ticket from '../models/ticketModel.js';
import userModel from '../models/userModel.js';
import Payment from '../models/paymentModel.js';

export const createPayment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { ticketId } = req.body;

    const ticket = await Ticket.findById({
      _id: ticketId,
      user: userId,
      status: 'pending'
    }).populate('event');

    if (!ticket) {
      return res.status(404).json({ success: false, message: "Pending ticket not found" });
    }

    const user = await userModel.findById(userId);

    const orderId = `ticket-${ticket._id}`;

    const parameter = {
    transaction_details: {
    order_id: `ticket-${ticket._id}`,
    gross_amount: ticket.total,
  },
    customer_details: {
    first_name: user.name || "Customer",
    email: user.email || "email@example.com",
  }
};

    const transaction = await snap.createTransaction(parameter);

    // Simpan payment URL ke tiket
    ticket.paymentUrl = transaction.redirect_url;
    await ticket.save();

    // Buat payment record
    await Payment.create({
      user: userId,
      ticket: ticket._id,
      paymentType: null, 
      transactionId: transaction.token,
      orderId: orderId,
      transactionStatus: 'pending',
      grossAmount: ticket.total,
      paymentResponse: transaction
    });

    res.status(201).json({
      success: true,
      message: "Payment URL created",
      token: transaction.token,
      redirect_url: transaction.redirect_url,
    });

  } catch (error) {
    console.error("Midtrans Error:", error);
    res.status(500).json({ success: false, message: "Failed to create payment", error: error.message });
  }
};


export const handleNotification = async (req, res) => {
  try {
    const { order_id } = req.body;

    if (!order_id) {
      return res.status(400).json({
        success: false,
        message: "Missing order_id from webhook",
      });
    }

    // 🔍 Cari payment berdasarkan order_id
    const payment = await Payment.findOne({ orderId: order_id });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Order ID tidak ditemukan di database",
      });
    }

    // ✅ Ambil status transaksi terbaru dari Midtrans (pakai order_id)
    const statusResponse = await coreApi.transaction.status(order_id);

    payment.transactionId = statusResponse.transaction_id; 
    payment.transactionStatus = statusResponse.transaction_status;
    payment.paymentType = statusResponse.payment_type;
    payment.paymentResponse = statusResponse;
    await payment.save();

    if (statusResponse.transaction_status === 'settlement') {
      await Ticket.findByIdAndUpdate(payment.ticket, { status: 'paid' });
    }

    return res.status(200).json({
      success: true,
      message: "Notifikasi berhasil diproses",
      data: statusResponse,
    });

  } catch (error) {
    console.error("Notification error:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan di server",
      error: error.message || error,
    });
  }
};