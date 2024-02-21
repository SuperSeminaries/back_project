import {v2 as cloudinary} from 'cloudinary';
import dotenv from "dotenv"
dotenv.config()
import fs from "fs"

cloudinary.config({ 
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    if (!localFilePath) return null

    try {
        const response = await cloudinary.uploader.upload(localFilePath, {resource_type: "auto"})
        fs.unlinkSync(localFilePath)

        return response;
    
    } catch (error) {
        console.error("Error uploading file to Cloudinary:", error);
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath)
        }
        return null
    }
}

export  { uploadOnCloudinary }