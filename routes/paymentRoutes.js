import express from 'express';
import {
  createPayment,
  handleNotification,
} from '../controllers/paymentController.js';
import userAuth from '../middleware/userAuth.js';

const PaymentRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Payment
 *   description: Endpoint terkait pembayaran tiket
 */

/**
 * @swagger
 * /payment/Create:
 *   post:
 *     summary: Membuat permintaan pembayaran (generate QRIS)
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - eventId
 *               - nominal
 *             properties:
 *               eventId:
 *                 type: string
 *                 description: ID event yang akan dibayar
 *               nominal:
 *                 type: number
 *                 description: Nominal pembayaran
 *     responses:
 *       200:
 *         description: QRIS berhasil dibuat
 *       400:
 *         description: Data tidak valid
 */
PaymentRouter.post('/Create', userAuth, createPayment);

/**
 * @swagger
 * /payment/Notification:
 *   post:
 *     summary: Endpoint notifikasi callback dari payment gateway
 *     tags: [Payment]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Payload notifikasi dari payment gateway
 *     responses:
 *       200:
 *         description: Notifikasi diterima dan diproses
 *       500:
 *         description: Kesalahan saat memproses notifikasi
 */
PaymentRouter.post('/Notification', handleNotification);

export default PaymentRouter;
