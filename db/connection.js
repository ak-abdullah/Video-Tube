import mongoose from 'mongoose'
import { DB_Name } from '../src/utils/constants.js'

export const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_Name}`)
        console.log(`Connected to MongoDB: ${connectionInstance.connection.host}`)
    } catch (error) {
        console.log("MongoDB connection error: ", error)
        process.exit(1)
    }
}