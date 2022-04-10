const router = require("express").Router();
const BookModel = require("../models/Book.model");
const uploader = require("../config/cloudinary.config");
const User = require("../models/User.model");

router.get("/", async (req, res, next) => {
  res.status(200).json("all good here");
});

router.post("/addbook", async (req, res) => {
  console.log("req.body for new book", req.body);
  try {
    const { bookName, bookAuthor, pages } = req.body;
    const newBookDB = await BookModel.create({ bookName, bookAuthor, pages });
    res.status(200).json({ newBook: newBookDB });
  } catch (err) {
    console.log("There was an error adding a book", err);
  }
});

router.get("/book-list", async (req, res) => {
  console.log(req.session);
  try {
    const allBooks = await BookModel.find();
    res.status(200).json(allBooks);
  } catch (err) {
    console.log("There was an error adding a book", err);
  }
});

router.post("/upload", uploader.single("userImage"), (req, res, next) => {
  // the uploader.single() callback will send the file to cloudinary and get you and obj with the url in return
  console.log("file is: ", req.file, "seesion is:", req.session);

  if (!req.file) {
    console.log("there was an error uploading the file");
    next(new Error("No file uploaded!"));
    return;
  }

  // You will get the image url in 'req.file.path'
  // Your code to store your url in your database should be here
  User.findByIdAndUpdate(
    { _id: req.session.user._id },
    { userImage: req.file.path }
  )
    .then((imageResponse) => {
      res.status(200).json(imageResponse);
    })
    .catch((err) => {
      res.status(400).json("There was a problem with updating your user");
    });
});
module.exports = router;
