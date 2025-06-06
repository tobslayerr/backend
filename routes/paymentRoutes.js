import express from 'express';
import { createPayment, handleNotification } from '../controllers/paymentController.js';
import userAuth from '../middleware/userAuth.js';  

const PaymentRouter = express.Router();

PaymentRouter.post('/Create', userAuth, createPayment); 
PaymentRouter.post('/Notification', handleNotification); 

export default PaymentRouter;


