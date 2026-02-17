const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "expense_tracker_profiles",
    allowed_formats: ["jpg", "jpeg", "png"],
    transformation: [
      { width: 300, height: 300, crop: "fill", gravity: "face" }
    ]
  }
});

const upload = multer({ storage });

module.exports = upload;
