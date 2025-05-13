import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './configs/mongodb.js'
import { clerWebhooks } from './controllers/webhooks.js'

// Inisialisasi Express
const app = express()

// Connect database
await connectDB()

// Middlewares
app.use(cors())

// Routes
app.get('/', (req, res)=> res.send("API Berjalan"))
app.post('/clerk', express.json(), clerWebhooks)


// Port
const PORT = process.env.PORT || 5000

app.listen(PORT, ()=> {
    console.log(`Server berjalan di port ${PORT}`)
})