import express from 'express';
import {
  createTransaction, // Mengganti createPayment
  handleMidtransNotification // Mengganti handleNotification
} from '../controllers/paymentController.js';
import userAuth from '../middleware/userAuth.js';

const PaymentRouter = express.Router();

// Route untuk membuat transaksi Midtrans
// Path diubah agar lebih deskriptif dan konsisten dengan frontend
PaymentRouter.post('/create-transaction', userAuth, createTransaction);

// Route untuk Midtrans Notification (Webhook). Ini TIDAK memerlukan userAuth
// Karena Midtrans yang akan memanggil endpoint ini.
// Path diubah agar lebih konsisten
PaymentRouter.post('/notification', handleMidtransNotification);

export default PaymentRouter;