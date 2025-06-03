import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import cookieParser from 'cookie-parser'
import connectDB from './config/mongodb.js'
import authRouter from './routes/authRoutes.js'
import userRouter from './routes/userRoutes.js'
import webRouter from './routes/webRoutes.js'
import adminRoutes from "./routes/adminRoutes.js"
import eventRoutes from "./routes/eventRoutes.js"; // Ini sudah diimpor dengan benar
import ReportRouter from './routes/reportRoutes.js'
import errorHandler from './middleware/errorMiddleware.js'
import TicketRouter from './routes/ticketRoutes.js'
import PaymentRouter from './routes/paymentRoutes.js'

const app = express()
const port = process.env.PORT || 4000
connectDB()

const allowedOrigins = ['http://localhost:5173']

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(cors({origin: allowedOrigins, credentials: true}));

// API ENDPOINT
app.get('/', (req, res)=> res.send("API Works"));
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/web', webRouter) ;
app.use("/api/admin", adminRoutes);
app.use("/api/event", eventRoutes); // Ini sudah digunakan dengan benar untuk semua rute event
app.use("/api/ticket", TicketRouter)
app.use("/api/report", ReportRouter);
app.use("/api/payment", PaymentRouter);

app.use(errorHandler);

app.listen(port, ()=> console.log(`Server running on port ${port}`));

export default app;