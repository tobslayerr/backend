import mongoose from 'mongoose'

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI
    if (!uri) {
      throw new Error('MONGO_URI is not defined in environment variables')
    }

    const conn = await mongoose.connect(uri, {
    })

    console.log(`MongoDB Atlas Connected`)
  } catch (error) {
    console.error(`Error: ${error.message}`)
    process.exit(1)
  }
}

export default connectDB