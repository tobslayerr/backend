import express from 'express';
import {verifyQrScan } from '../controllers/qrController.js';
import userAuth from '../middleware/userAuth.js';

const qrRouter = express.Router();

qrRouter.get('/verifyqr', verifyQrScan);

export default qrRouter;
