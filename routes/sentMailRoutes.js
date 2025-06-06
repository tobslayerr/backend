import express from 'express';
import { verifyQrScan } from '../controllers/qrController.js';
import { sendTicketQr, sendTicketOnline } from '../controllers/sentEmailController.js';
import userAuth from '../middleware/userAuth.js';

const sentMailRouter = express.Router();

sentMailRouter.get('/TicketQr/:ticketId', userAuth, sendTicketQr);
sentMailRouter.get('/TicketOnline/:ticketId', userAuth, sendTicketOnline);
sentMailRouter.post('/verifyqr', verifyQrScan);

export default sentMailRouter;