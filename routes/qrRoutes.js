import express from 'express';
import { generateTicketQr, verifyQrScan } from '../controllers/qrController.js';
import userAuth from '../middleware/userAuth.js';

const qrRouter = express.Router();

qrRouter.get('/generateqr/:ticketId', userAuth, generateTicketQr);
qrRouter.get('/verifyqr', verifyQrScan);

export default qrRouter;