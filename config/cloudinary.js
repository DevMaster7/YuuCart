const { v2: cloudinary } = require("cloudinary");
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// takes buffer instead of file path
const uploadOnCloudinary = async (fileBuffer, folderName) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: folderName },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
    stream.end(fileBuffer);
  });
};

const uploadImageFromUrl = async (imageUrl, folderName) => {
  try {
    const result = await cloudinary.uploader.upload(imageUrl, {
      folder: folderName,
    });
    return result.secure_url;
  } catch (error) {
    console.error("Error uploading image from URL:", error);
    throw error;
  }
};

module.exports = { uploadOnCloudinary, uploadImageFromUrl };
