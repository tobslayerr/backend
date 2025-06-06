import express from 'express';
<<<<<<< HEAD
import { createPayment, handleNotification } from '../controllers/paymentController.js';
import userAuth from '../middleware/userAuth.js';  

const PaymentRouter = express.Router();

PaymentRouter.post('/Create', userAuth, createPayment); 
PaymentRouter.post('/Notification', handleNotification); 

export default PaymentRouter;
=======
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
>>>>>>> a86b8eb9da78aed4e980998d93a6e82ea1589e1a
