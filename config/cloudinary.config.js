// the following 3 packages are needed in order for cloudinary to run
const cloudinary = require("cloudinary").v2; // for verification
const multer = require("multer"); // middleware for handling data, which is primarily used for uploading files
const { CloudinaryStorage } = require("multer-storage-cloudinary"); // to access cloudinary storage

// your three cloudinary keys will be passed here from your .env file
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  folder: "JoshIsCool", // The name of the folder in cloudinary . You can name this whatever you want
  allowedFormats: ["jpg", "png"],
  // params: { resource_type: 'raw' }, => add this is in case you want to upload other type of files, not just images
  filename: function (req, res, cb) {
    cb(null, res.originalname); // The file on cloudinary will have the same name as the original file name
  },
});

module.exports = multer({ storage });
