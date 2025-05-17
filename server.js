import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import cookieParser from 'cookie-parser'
import connectDB from './config/mongodb.js'
import authRouter from './routes/authRoutes.js'
import userRouter from './routes/userRoutes.js'
import webRouter from './routes/webRoutes.js'
import adminRoutes from "./routes/adminRoutes.js"
import eventRoutes from "./routes/eventRoutes.js";

const app = express()
const port = process.env.PORT || 4000
connectDB()

const allowedOrigins = ['http://localhost:5174']

app.use(express.json())
app.use(cookieParser())
app.use(cors({origin: allowedOrigins, credentials: true}))

// API ENDPOINT
app.get('/', (req, res)=> res.send("API Works"))
app.use('/api/auth', authRouter)
app.use('/api/user', userRouter)
app.use('/api/web', webRouter) 
app.use("/api/admin", adminRoutes);
app.use("/api/event", eventRoutes);

app.listen(port, ()=> console.log(`Server running on port ${port}`))