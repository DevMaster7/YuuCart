const { v2: cloudinary } = require("cloudinary");
const fs = require("fs/promises");
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath, folderName) => {
    try {
        if (!localFilePath) return null;

        const result = await cloudinary.uploader.upload(localFilePath, {
            folder: folderName,
        });

        await fs.unlink(localFilePath);

        return result.secure_url;

    } catch (error) {
        console.error("Error uploading image:", error);
        return null;
    }
}

module.exports = uploadOnCloudinary;