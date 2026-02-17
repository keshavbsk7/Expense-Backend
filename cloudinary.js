const cloudinary = require("cloudinary").v2;
console.log("Cloudinary ENV CHECK:", {
  cloud: process.env.CLOUDINARY_CLOUD_NAME,
  key: process.env.CLOUDINARY_API_KEY ? "FOUND" : "MISSING",
  secret: process.env.CLOUDINARY_API_SECRET ? "FOUND" : "MISSING"
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

module.exports = cloudinary;
