import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import dotenv from 'dotenv'
dotenv.config({ path: './.env' })


// Configuration
const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: 'auto',
        })

        fs.unlinkSync(localFilePath)
        console.log("What is response of cloudinary: ", response)
        return response
    } catch (error) {
        fs.unlinkSync(localFilePath)
        return null
    }
}
/**
 * @param {string} cloudinaryUrl - The full URL of the file to delete
 * @param {string} resourceType - 'image' or 'video' (default is 'image')
 */
const deleteFromCloudinary = async (cloudinaryUrl, resourceType = "image") => {
    try {
        if (!cloudinaryUrl) return null;

        // 1. Extract Public ID from URL
        // Example: https://res.cloudinary.com/.../v12345/folder/my_image.jpg -> folder/my_image
        const publicId = cloudinaryUrl.split("/").pop().split(".")[0];

        // 2. Delete from Cloudinary
        const response = await cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType
        });

        return response;
    } catch (error) {
        console.error("Error deleting from Cloudinary:", error);
        return null;
    }
};

export { uploadOnCloudinary, deleteFromCloudinary }    