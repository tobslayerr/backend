import express from 'express';
import { verifyQrScan } from '../controllers/qrController.js';
import { sendTicketQr, sendTicketOnline } from '../controllers/sentEmailController.js';
import userAuth from '../middleware/userAuth.js';

const sentMailRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: SentMail
 *   description: API untuk pengiriman email tiket dan verifikasi QR
 */

/**
 * @swagger
 * /api/mail/TicketQr/{ticketId}:
 *   get:
 *     summary: Kirim email berisi QR tiket untuk tiket fisik
 *     tags: [SentMail]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ticketId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID tiket yang ingin dikirimkan QR-nya
 *     responses:
 *       200:
 *         description: Email berhasil dikirim
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Tiket tidak ditemukan
 */
sentMailRouter.get('/TicketQr/:ticketId', userAuth, sendTicketQr);

/**
 * @swagger
 * /api/mail/TicketOnline/{ticketId}:
 *   get:
 *     summary: Kirim email berisi link tiket online
 *     tags: [SentMail]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ticketId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID tiket yang ingin dikirimkan link onlinenya
 *     responses:
 *       200:
 *         description: Email berhasil dikirim
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Tiket tidak ditemukan
 */
sentMailRouter.get('/TicketOnline/:ticketId', userAuth, sendTicketOnline);

/**
 * @swagger
 * /api/mail/verifyqr:
 *   post:
 *     summary: Verifikasi QR code tiket
 *     tags: [SentMail]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               qrData:
 *                 type: string
 *                 description: Data QR yang akan diverifikasi
 *     responses:
 *       200:
 *         description: QR code valid
 *       400:
 *         description: QR code tidak valid atau format salah
 */
sentMailRouter.post('/verifyqr', verifyQrScan);

export default sentMailRouter;
