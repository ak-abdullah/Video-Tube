import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import dotenv from 'dotenv'
dotenv.config({path: './.env'})


    // Configuration
const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: 'auto',
        })
        return response
    } catch (error) {
        fs.unlinkSync(localFilePath)    
        return null
    }
}
export { uploadOnCloudinary }    