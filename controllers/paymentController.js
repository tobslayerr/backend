<<<<<<< HEAD
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
=======
import Event from '../models/eventModel.js'; // Pastikan Event model diimpor
import Ticket from '../models/ticketModel.js'; // Ini adalah model Tiket Pembelian (user's purchased tickets)
import Payment from '../models/paymentModel.js'; // Model Pembayaran Anda
import { snap, coreApi } from '../config/midtrans.js'; // Impor snap dan coreApi dari config/midtrans.js
import asyncHandler from 'express-async-handler'; // Jika Anda menggunakan ini, pastikan terinstal

// Fungsi untuk membuat transaksi Midtrans
export const createTransaction = asyncHandler(async (req, res) => {
  // Mengambil eventId dan array tiket yang dipilih dari frontend
  const { eventId, tickets: purchasedTickets } = req.body;
  const userId = req.user.id; // Dapatkan ID pengguna dari middleware otentikasi

  if (!userId) {
    res.status(401);
    throw new Error('User not authenticated.');
  }

  if (!eventId || !purchasedTickets || purchasedTickets.length === 0) {
    res.status(400);
    throw new Error('Event ID and selected tickets are required.');
  }

  const event = await Event.findById(eventId);
  if (!event) {
    res.status(404);
    throw new Error('Event not found.');
  }

  let totalAmount = 0;
  const itemDetails = []; // Untuk Midtrans item_details
  const ticketsToSaveToPayment = []; // Untuk menyimpan detail tiket ke model Payment
  const ticketsToCreateInTicketModel = []; // Untuk membuat record di model Ticket

  for (const pTicket of purchasedTickets) {
    // Temukan jenis tiket yang dipilih di dalam array event.tickets
    const eventTicketType = event.tickets.id(pTicket.ticketTypeId);
    if (!eventTicketType) {
      res.status(404);
      throw new Error(`Ticket type with ID ${pTicket.ticketTypeId} not found for this event.`);
    }

    // Validasi kuantitas yang diminta
    if (pTicket.quantity <= 0 || pTicket.quantity > eventTicketType.quantity) {
      res.status(400);
      throw new Error(`Invalid quantity for ticket type ${eventTicketType.name}. Available: ${eventTicketType.quantity}`);
    }

    // Jika tiket berbayar, tambahkan ke totalAmount dan itemDetails Midtrans
    if (!eventTicketType.isFree && eventTicketType.price > 0) {
      const price = eventTicketType.price;
      const quantity = pTicket.quantity;
      const grossAmount = price * quantity;

      totalAmount += grossAmount;

      itemDetails.push({
        id: eventTicketType._id.toString(), // ID jenis tiket dari Event model
        name: eventTicketType.name,
        price: price,
        quantity: quantity,
      });
    }

    // Siapkan detail tiket untuk disimpan di model Payment
    ticketsToSaveToPayment.push({
      ticketTypeId: eventTicketType._id,
      name: eventTicketType.name,
      quantity: pTicket.quantity,
      price: eventTicketType.price,
      isFree: eventTicketType.isFree,
    });

    // Siapkan detail tiket untuk dibuat di model Ticket (status pending)
    ticketsToCreateInTicketModel.push({
      event: event._id,
      user: userId,
      eventTicketType: eventTicketType._id,
      quantity: pTicket.quantity,
      price: eventTicketType.price,
      total: eventTicketType.price * pTicket.quantity,
      eventDate: event.date,
      status: 'pending', // Status awal tiket
    });
  }

  // Jika semua tiket yang dipilih gratis, langsung catat di database tanpa Midtrans
  if (totalAmount === 0) {
    const newTickets = await Ticket.insertMany(ticketsToCreateInTicketModel.map(t => ({
      ...t,
      status: 'paid', // Langsung set paid karena gratis
    })));

    // Buat record pembayaran untuk event gratis
    await Payment.create({
      user: userId,
      event: eventId,
      order_id: `FREE-${Date.now()}-${userId}`, // Order ID khusus untuk gratis
      gross_amount: 0,
      currency: 'IDR',
      transaction_status: 'settlement', // Anggap langsung settlement
      isPaid: true,
      tickets: ticketsToSaveToPayment,
      payment_type: 'free_event',
    });

    return res.status(200).json({
      success: true,
      message: 'Tickets purchased successfully (free event).',
      tickets: newTickets,
    });
  }

  const order_id = `ORDER-${Date.now()}-${userId}`; // ID unik untuk transaksi Anda

  const parameter = {
    transaction_details: {
      order_id: order_id,
      gross_amount: totalAmount,
    },
    item_details: itemDetails,
    customer_details: {
      first_name: req.user.name || "Customer", // Asumsi nama pengguna ada di req.user
      email: req.user.email || "email@example.com", // Asumsi email pengguna ada di req.user
      // phone: '08123456789', // Opsional: nomor telepon pelanggan
    },
    credit_card: {
      secure: true, // Mengaktifkan 3D Secure
    },
    enabled_payments: [
      'credit_card', 'gopay', 'permata_va', 'bca_va', 'bni_va', 'bri_va',
      'other_va', 'indomaret', 'alfamart'
    ],
    callbacks: {
      // Anda bisa menentukan URL callback finish/error/pending di sini
      // Atau biarkan Midtrans memanggil endpoint /api/payment/notification
      // finish: `${process.env.FRONTEND_URL}/payment-success`,
      // error: `${process.env.FRONTEND_URL}/payment-error`,
      // pending: `${process.env.FRONTEND_URL}/payment-pending`,
    },
  };

  try {
    const transaction = await snap.createTransaction(parameter);
    const snapToken = transaction.token;

    // Buat record pembayaran awal di database Anda
    const payment = await Payment.create({
      user: userId,
      event: eventId,
      order_id: order_id,
      gross_amount: totalAmount,
      currency: 'IDR',
      transaction_status: 'pending',
      transaction_token: snapToken,
      tickets: ticketsToSaveToPayment, // Simpan detail tiket yang akan dibeli
    });

    // Buat record tiket di model Ticket dengan status pending
    const createdTickets = await Ticket.insertMany(ticketsToCreateInTicketModel.map(t => ({
      ...t,
      payment: payment._id, // Kaitkan tiket dengan record pembayaran
    })));

    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      token: snapToken,
      redirect_url: transaction.redirect_url, // URL untuk redirect jika tidak menggunakan Snap pop-up
    });
  } catch (error) {
    console.error("Error creating Midtrans transaction:", error);
    res.status(500);
    throw new Error('Failed to create Midtrans transaction. ' + error.message);
  }
});


// Fungsi untuk menangani notifikasi (callback) dari Midtrans
export const handleMidtransNotification = asyncHandler(async (req, res) => {
  const notification = req.body;

  // Verifikasi notifikasi menggunakan coreApi (lebih aman)
  // Ini penting untuk keamanan!
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  const signatureKey = coreApi.transactions.notification.createSignatureKey(
    notification.order_id,
    notification.status_code, // Gunakan status_code dari notifikasi
    notification.gross_amount,
    serverKey
  );

  if (signatureKey !== notification.signature_key) {
    console.warn('Invalid signature key received from Midtrans for order:', notification.order_id);
    return res.status(401).json({ message: 'Invalid signature key' });
  }

  // Temukan pembayaran yang sesuai di database Anda
  const payment = await Payment.findOne({ order_id: notification.order_id });

  if (!payment) {
    console.warn('Payment not found for order_id:', notification.order_id);
    return res.status(404).json({ message: 'Payment not found' });
  }

  // Perbarui status transaksi berdasarkan notifikasi dari Midtrans
  payment.transaction_status = notification.transaction_status;
  payment.raw_midtrans_response = notification; // Simpan seluruh payload notifikasi
  payment.transaction_time = notification.transaction_time;
  payment.payment_type = notification.payment_type;
  payment.fraud_status = notification.fraud_status;

  let message = 'Notification processed.';

  switch (notification.transaction_status) {
    case 'capture': // Untuk kartu kredit
    case 'settlement': // Untuk metode pembayaran lain (VA, e-wallet)
      // Pembayaran berhasil
      payment.isPaid = true;

      // Perbarui status tiket yang terkait dengan pembayaran ini menjadi 'paid'
      await Ticket.updateMany(
        { payment: payment._id, status: 'pending' },
        { $set: { status: 'paid' } }
      );

      // Kurangi kuantitas tiket yang tersedia di Event model
      const event = await Event.findById(payment.event);
      if (event) {
        for (const purchasedTicket of payment.tickets) {
          const eventTicketType = event.tickets.id(purchasedTicket.ticketTypeId);
          if (eventTicketType) {
            // Pastikan quantity tidak menjadi negatif
            eventTicketType.quantity = Math.max(0, eventTicketType.quantity - purchasedTicket.quantity);
          }
        }
        await event.save();
      }
      message = 'Payment successful!';
      break;
    case 'pending':
      // Pembayaran masih tertunda
      message = 'Payment pending.';
      break;
    case 'deny':
    case 'cancel':
    case 'expire':
      // Pembayaran dibatalkan atau kadaluarsa
      payment.isPaid = false;
      // Perbarui status tiket yang terkait dengan pembayaran ini menjadi 'cancelled'
      await Ticket.updateMany(
        { payment: payment._id, status: 'pending' },
        { $set: { status: 'cancelled' } }
      );
      // Opsional: Anda mungkin ingin mengembalikan stok tiket jika dibatalkan setelah dikurangi
      // (Ini tergantung pada kapan Anda mengurangi stok, biasanya setelah settlement)
      message = 'Payment failed or cancelled.';
      break;
    default:
      message = 'Unhandled transaction status.';
      break;
  }

  await payment.save();

  res.status(200).json({ success: true, message });
});
>>>>>>> a86b8eb9da78aed4e980998d93a6e82ea1589e1a
