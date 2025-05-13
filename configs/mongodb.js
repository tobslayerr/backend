import mongoose from "mongoose";

// Menghubungkan ke mongoDB database
const connectDB = async ()=> {
    mongoose.connection.on('connected', ()=> console.log('Database Terhubung'))

    await mongoose.connect(`${process.env.MONGODB_URL}/sievent`)
}

export default connectDB