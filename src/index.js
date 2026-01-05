import dotenv from 'dotenv'
import express from 'express'
// import mongoose from 'mongoose'
// import { DB_Name } from '../utils/constants.js'
import { connectDB } from '../db/connection.js'
dotenv.config({path: './.env'})
import { app } from './app.js'

/*
;(async ()=>{
    try{
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_Name}`)
        console.log('Connected to MongoDB')
        app.on("error", (error) => {
            console.log("SERVER ERROR: ", error);
            throw error;
        });
        app.listen(process.env.PORT, () => {
            console.log(`Server is running on port ${process.env.PORT}`)
        })
    }catch(error){
        console.log(error)
    }
})()
*/
connectDB().then(()=>{
    app.listen(process.env.PORT || 8000, ()=>{
        console.log(`Server is running on port http://localhost:${process.env.PORT}`)
    })
}).catch((error)=>{
    console.log("MongoDB connection error: ", error)
    process.exit(1)
})
