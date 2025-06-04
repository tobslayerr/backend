import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import cookieParser from 'cookie-parser'
import connectDB from './config/mongodb.js'
import authRouter from './routes/authRoutes.js'
import userRouter from './routes/userRoutes.js'
import webRouter from './routes/webRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import eventRoutes from './routes/eventRoutes.js'
import ReportRouter from './routes/reportRoutes.js'
import errorHandler from './middleware/errorMiddleware.js'
import TicketRouter from './routes/ticketRoutes.js'
import PaymentRouter from './routes/paymentRoutes.js'
import ratingRoutes from './routes/ratingsRoutes.js'
const app = express()
const port = process.env.PORT || 4000

// Connect to MongoDB
connectDB()

// ✅ CORS Configuration
const allowedOrigins = [
  "http://localhost:5173",
  "https://sievent-frontend.vercel.app",
]

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like Postman or curl)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error("Not allowed by CORS"))
      }
    },
    credentials: true,
  })
)

// Middleware
app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }))

// API ENDPOINTS
app.get('/', (req, res) => res.send("API Works"))
app.use('/api/auth', authRouter)
app.use('/api/user', userRouter)
app.use('/api/web', webRouter)
app.use('/api/admin', adminRoutes)
app.use('/api/event', eventRoutes)
app.use('/api/ticket', TicketRouter)
app.use('/api/report', ReportRouter)
app.use('/api/payment', PaymentRouter)
app.use('/api/ratings', ratingRoutes);
// Global Error Handler
app.use(errorHandler)

// Server Listen
app.listen(port, () => console.log(`Server running on port ${port}`))

export default app
