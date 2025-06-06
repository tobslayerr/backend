import express from 'express';
import { verifyQrScan } from '../controllers/qrController.js';
import userAuth from '../middleware/userAuth.js';

const qrRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: QR
 *   description: Endpoint untuk verifikasi QR code
 */

/**
 * @swagger
 * /qr/verifyqr:
 *   get:
 *     summary: Verifikasi hasil scan QR code
 *     tags: [QR]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: code
 *         schema:
 *           type: string
 *         required: true
 *         description: Kode QR yang akan diverifikasi
 *     responses:
 *       200:
 *         description: QR code berhasil diverifikasi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valid:
 *                   type: boolean
 *                   description: Status validasi QR
 *                 message:
 *                   type: string
 *                   description: Pesan hasil verifikasi
 *       400:
 *         description: Parameter kode QR tidak valid atau tidak lengkap
 *       401:
 *         description: Unauthorized, token tidak valid atau tidak ada
 */
qrRouter.get('/verifyqr', userAuth, verifyQrScan);

export default qrRouter;
