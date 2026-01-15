import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'

dotenv.config({path: './.env'})

const app = express()
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}))

app.use(express.json({limit: '16kb'}))
app.use(express.urlencoded({extended: true, limit: '16kb'}))
app.use(express.static("public"))
app.use(cookieParser())                              


//routes

import userRoutes from './routes/user.routes.js'                                
import commentRoutes from './routes/comment.routes.js'
import videoRoutes from './routes/video.routes.js'

app.use('/api/v1/users', userRoutes)
app.use('/api/v1/comments', commentRoutes)
app.use('/api/v1/videos', videoRoutes)
                    
export {app}
